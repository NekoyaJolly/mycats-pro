'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Group,
  Card,
  Text,
  Badge,
  Stack,
  Modal,
  TextInput,
  Select,
  Tabs,
  Grid,
  ActionIcon,
  Container,
  Alert,
  ColorSwatch,
  SimpleGrid,
  Divider,
} from '@mantine/core';
import { PageTitle } from '@/components/PageTitle';
import { useDisclosure } from '@mantine/hooks';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconTag,
  IconPalette,
  IconInfoCircle,
} from '@tabler/icons-react';

// タグカテゴリの型定義
interface TagCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  tags: Tag[];
}

// タグの型定義
interface Tag {
  id: string;
  name: string;
  categoryId: string;
  color: string;
  description?: string;
  usageCount: number;
}

// 事前定義されたカラーパレット
const PRESET_COLORS = [
  '#e74c3c', '#e67e22', '#f39c12', '#f1c40f', '#2ecc71',
  '#1abc9c', '#3498db', '#9b59b6', '#34495e', '#95a5a6'
];

// デフォルトのタグカテゴリ（初期データは空）
const defaultTagCategories: TagCategory[] = [];

export default function TagsPage() {
  const [tagCategories, setTagCategories] = useState<TagCategory[]>(defaultTagCategories);
  const [categoryModalOpened, { open: openCategoryModal, close: closeCategoryModal }] = useDisclosure(false);
  const [tagModalOpened, { open: openTagModal, close: closeTagModal }] = useDisclosure(false);
  const [editingCategory, setEditingCategory] = useState<TagCategory | null>(null);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  // カテゴリフォーム用の状態
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    color: PRESET_COLORS[0],
  });

  // タグフォーム用の状態
  const [tagForm, setTagForm] = useState({
    name: '',
    categoryId: '',
    color: PRESET_COLORS[0],
    description: '',
  });

  // カテゴリ作成・編集
  const handleSaveCategory = () => {
    if (!categoryForm.name.trim()) return;

    if (editingCategory) {
      // 編集
      setTagCategories(prev => prev.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, ...categoryForm }
          : cat
      ));
    } else {
      // 新規作成
      const newCategory: TagCategory = {
        id: `cat${Date.now()}`,
        ...categoryForm,
        tags: [],
      };
      setTagCategories(prev => [...prev, newCategory]);
    }

    setCategoryForm({ name: '', description: '', color: PRESET_COLORS[0] });
    setEditingCategory(null);
    closeCategoryModal();
  };

  // タグ作成・編集
  const handleSaveTag = () => {
    if (!tagForm.name.trim() || !tagForm.categoryId) return;

    if (editingTag) {
      // 編集
      setTagCategories(prev => prev.map(category => ({
        ...category,
        tags: category.tags.map(tag => 
          tag.id === editingTag.id 
            ? { ...tag, ...tagForm, usageCount: tag.usageCount }
            : tag
        )
      })));
    } else {
      // 新規作成
      const newTag: Tag = {
        id: `tag${Date.now()}`,
        ...tagForm,
        usageCount: 0,
      };
      setTagCategories(prev => prev.map(category => 
        category.id === tagForm.categoryId 
          ? { ...category, tags: [...category.tags, newTag] }
          : category
      ));
    }

    setTagForm({ name: '', categoryId: '', color: PRESET_COLORS[0], description: '' });
    setEditingTag(null);
    closeTagModal();
  };

  // カテゴリ編集開始
  const startEditCategory = (category: TagCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
      color: category.color,
    });
    openCategoryModal();
  };

  // タグ編集開始
  const startEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setTagForm({
      name: tag.name,
      categoryId: tag.categoryId,
      color: tag.color,
      description: tag.description || '',
    });
    openTagModal();
  };

  // カテゴリ削除
  const deleteCategory = (categoryId: string) => {
    if (confirm('このカテゴリとすべてのタグを削除しますか？')) {
      setTagCategories(prev => prev.filter(cat => cat.id !== categoryId));
    }
  };

  // タグ削除
  const deleteTag = (tagId: string) => {
    if (confirm('このタグを削除しますか？')) {
      setTagCategories(prev => prev.map(category => ({
        ...category,
        tags: category.tags.filter(tag => tag.id !== tagId)
      })));
    }
  };

  const openNewTagModal = (categoryId?: string) => {
    setTagForm({
      name: '',
      categoryId: categoryId || '',
      color: PRESET_COLORS[0],
      description: '',
    });
    setEditingTag(null);
    openTagModal();
  };

  return (
  <Container size="lg" style={{ minHeight: '100vh', backgroundColor: 'var(--background-base)', padding: '1rem', paddingBottom: '5rem' }}>
      {/* ヘッダー */}
      <Group justify="space-between" mb="lg" wrap="wrap">
  <PageTitle style={{ color: 'var(--text-primary)' }}>タグ管理</PageTitle>
        <Group gap="sm">
          <Button 
            leftSection={<IconPlus size={16} />} 
            onClick={() => {
              setCategoryForm({ name: '', description: '', color: PRESET_COLORS[0] });
              setEditingCategory(null);
              openCategoryModal();
            }}
            variant="outline"
            size="sm"
          >
            カテゴリ追加
          </Button>
          <Button 
            leftSection={<IconTag size={16} />} 
            onClick={() => openNewTagModal()}
            size="sm"
          >
            タグ追加
          </Button>
        </Group>
      </Group>

      {/* 説明 */}
      <Alert icon={<IconInfoCircle size={16} />} mb="lg" variant="light">
        タグを使用して猫の特徴や分類を管理できます。カテゴリごとに整理して、検索や分類に活用しましょう。
      </Alert>

      {/* タブ */}
      <Tabs defaultValue="categories" variant="outline" mb="md">
        <Tabs.List>
          <Tabs.Tab value="categories" leftSection={<IconPalette size={14} />}>
            カテゴリ管理
          </Tabs.Tab>
          <Tabs.Tab value="tags" leftSection={<IconTag size={14} />}>
            タグ一覧
          </Tabs.Tab>
        </Tabs.List>

        {/* カテゴリ管理タブ */}
        <Tabs.Panel value="categories" pt="md">
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {tagCategories.map((category) => (
              <Card key={category.id} shadow="sm" padding="md" radius="md" withBorder>
                <Stack gap="sm">
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="xs">
                      <ColorSwatch color={category.color} size={20} />
                      <Text fw={500} size="md">{category.name}</Text>
                    </Group>
                    <Group gap="xs">
                      <ActionIcon variant="light" size="sm" onClick={() => startEditCategory(category)}>
                        <IconEdit size={14} />
                      </ActionIcon>
                      <ActionIcon variant="light" size="sm" color="red" onClick={() => deleteCategory(category.id)}>
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  </Group>
                  
                  <Text size="sm" c="dimmed">{category.description}</Text>
                  
                  <Group gap="xs">
                    <Text size="xs" c="dimmed">タグ数:</Text>
                    <Badge size="sm" variant="light">{category.tags.length}</Badge>
                  </Group>

                  <Divider />

                  {/* カテゴリ内のタグ表示 */}
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Text size="sm" fw={500}>タグ</Text>
                      <ActionIcon size="xs" variant="light" onClick={() => openNewTagModal(category.id)}>
                        <IconPlus size={12} />
                      </ActionIcon>
                    </Group>
                    <Group gap="xs">
                      {category.tags.slice(0, 3).map((tag) => (
                        <Badge 
                          key={tag.id} 
                          size="xs" 
                          variant="light" 
                          style={{ backgroundColor: `${tag.color}15`, color: tag.color }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                      {category.tags.length > 3 && (
                        <Badge size="xs" variant="outline" c="dimmed">
                          +{category.tags.length - 3}
                        </Badge>
                      )}
                    </Group>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Tabs.Panel>

        {/* タグ一覧タブ */}
        <Tabs.Panel value="tags" pt="md">
          <Stack gap="md">
            {tagCategories.map((category) => (
              <Card key={category.id} shadow="sm" padding="md" radius="md" withBorder>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Group gap="xs">
                      <ColorSwatch color={category.color} size={16} />
                      <Text fw={500} c={category.color}>{category.name}</Text>
                    </Group>
                    <Badge size="sm" variant="light">
                      {category.tags.length}個
                    </Badge>
                  </Group>
                  
                  <Grid>
                    {category.tags.map((tag) => (
                      <Grid.Col key={tag.id} span={{ base: 12, sm: 6, md: 4 }}>
                        <Card padding="xs" radius="sm" withBorder bg={`${tag.color}08`}>
                          <Group justify="space-between" wrap="nowrap">
                            <Stack gap={2}>
                              <Group gap="xs">
                                <Text size="sm" fw={500} style={{ color: tag.color }}>
                                  {tag.name}
                                </Text>
                                <Badge size="xs" variant="outline">
                                  {tag.usageCount}回使用
                                </Badge>
                              </Group>
                              {tag.description && (
                                <Text size="xs" c="dimmed">{tag.description}</Text>
                              )}
                            </Stack>
                            <Group gap="xs">
                              <ActionIcon size="xs" variant="subtle" onClick={() => startEditTag(tag)}>
                                <IconEdit size={10} />
                              </ActionIcon>
                              <ActionIcon size="xs" variant="subtle" color="red" onClick={() => deleteTag(tag.id)}>
                                <IconTrash size={10} />
                              </ActionIcon>
                            </Group>
                          </Group>
                        </Card>
                      </Grid.Col>
                    ))}
                  </Grid>
                  
                  {category.tags.length === 0 && (
                    <Text size="sm" c="dimmed" ta="center" py="md">
                      このカテゴリにはまだタグがありません
                    </Text>
                  )}
                </Stack>
              </Card>
            ))}
          </Stack>
        </Tabs.Panel>
      </Tabs>

      {/* カテゴリ作成・編集モーダル */}
      <Modal 
        opened={categoryModalOpened} 
        onClose={closeCategoryModal} 
        title={editingCategory ? "カテゴリ編集" : "新規カテゴリ作成"} 
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="カテゴリ名"
            placeholder="例：体型・サイズ"
            value={categoryForm.name}
            onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
          />
          
          <TextInput
            label="説明"
            placeholder="例：猫の体型や大きさに関するタグ"
            value={categoryForm.description}
            onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
          />
          
          <Box>
            <Text size="sm" fw={500} mb="xs">カテゴリカラー</Text>
            <Group gap="xs">
              {PRESET_COLORS.map((color) => (
                <ColorSwatch
                  key={color}
                  color={color}
                  size={32}
                  style={{ 
                    cursor: 'pointer',
                    border: categoryForm.color === color ? '2px solid #000' : 'none'
                  }}
                  onClick={() => setCategoryForm(prev => ({ ...prev, color }))}
                />
              ))}
            </Group>
          </Box>
          
          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={closeCategoryModal}>
              キャンセル
            </Button>
            <Button onClick={handleSaveCategory} disabled={!categoryForm.name.trim()}>
              {editingCategory ? "更新" : "作成"}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* タグ作成・編集モーダル */}
      <Modal 
        opened={tagModalOpened} 
        onClose={closeTagModal} 
        title={editingTag ? "タグ編集" : "新規タグ作成"} 
        size="md"
      >
        <Stack gap="md">
          <Select
            label="カテゴリ"
            placeholder="カテゴリを選択"
            value={tagForm.categoryId}
            onChange={(value) => setTagForm(prev => ({ ...prev, categoryId: value || '' }))}
            data={tagCategories.map(cat => ({ value: cat.id, label: cat.name }))}
          />
          
          <TextInput
            label="タグ名"
            placeholder="例：大型"
            value={tagForm.name}
            onChange={(e) => setTagForm(prev => ({ ...prev, name: e.target.value }))}
          />
          
          <TextInput
            label="説明（任意）"
            placeholder="例：体重5kg以上"
            value={tagForm.description}
            onChange={(e) => setTagForm(prev => ({ ...prev, description: e.target.value }))}
          />
          
          <Box>
            <Text size="sm" fw={500} mb="xs">タグカラー</Text>
            <Group gap="xs">
              {PRESET_COLORS.map((color) => (
                <ColorSwatch
                  key={color}
                  color={color}
                  size={32}
                  style={{ 
                    cursor: 'pointer',
                    border: tagForm.color === color ? '2px solid #000' : 'none'
                  }}
                  onClick={() => setTagForm(prev => ({ ...prev, color }))}
                />
              ))}
            </Group>
          </Box>
          
          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={closeTagModal}>
              キャンセル
            </Button>
            <Button 
              onClick={handleSaveTag} 
              disabled={!tagForm.name.trim() || !tagForm.categoryId}
            >
              {editingTag ? "更新" : "作成"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
