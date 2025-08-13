'use client';

import { useState, useEffect } from 'react';
import {
  MultiSelect,
  Badge,
  Group,
  Box,
  Text,
  Stack,
  Card,
  Button,
  Modal,
  SimpleGrid,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';

// タグ関連の型定義
interface Tag {
  id: string;
  name: string;
  categoryId: string;
  color: string;
  description?: string;
  usageCount: number;
}

interface TagCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  tags: Tag[];
}

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tagIds: string[]) => void;
  placeholder?: string;
  label?: string;
  categories?: TagCategory[];
}

// デフォルトのタグカテゴリ（実際の実装では外部から取得）
const defaultCategories: TagCategory[] = [
  {
    id: '1',
    name: '体型・サイズ',
    description: '猫の体型や大きさに関するタグ',
    color: '#3498db',
    tags: [
      { id: 't1', name: '大型', categoryId: '1', color: '#3498db', usageCount: 12 },
      { id: 't2', name: '中型', categoryId: '1', color: '#3498db', usageCount: 8 },
      { id: 't3', name: '小型', categoryId: '1', color: '#3498db', usageCount: 5 },
    ]
  },
  {
    id: '2',
    name: '性格・特徴',
    description: '猫の性格や行動特徴に関するタグ',
    color: '#e67e22',
    tags: [
      { id: 't4', name: '人懐っこい', categoryId: '2', color: '#e67e22', usageCount: 15 },
      { id: 't5', name: '内気', categoryId: '2', color: '#e67e22', usageCount: 7 },
      { id: 't6', name: '活発', categoryId: '2', color: '#e67e22', usageCount: 10 },
    ]
  },
  {
    id: '3',
    name: '健康状態',
    description: '健康や医療に関するタグ',
    color: '#e74c3c',
    tags: [
      { id: 't7', name: '要注意', categoryId: '3', color: '#e74c3c', usageCount: 3 },
      { id: 't8', name: '健康', categoryId: '3', color: '#2ecc71', usageCount: 20 },
    ]
  },
];

export default function TagSelector({ 
  selectedTags, 
  onChange, 
  placeholder = "タグを選択", 
  label = "タグ",
  categories = defaultCategories 
}: TagSelectorProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [allTags, setAllTags] = useState<Tag[]>([]);

  useEffect(() => {
    // 全カテゴリからタグを抽出
    const tags = categories.flatMap(category => category.tags);
    setAllTags(tags);
  }, [categories]);

  // MultiSelect用のデータ形式に変換
  const tagOptions = allTags.map(tag => ({
    value: tag.id,
    label: tag.name,
    color: tag.color,
  }));

  // 選択されたタグの詳細情報を取得
  const getSelectedTagDetails = () => {
    return selectedTags.map(tagId => allTags.find(tag => tag.id === tagId)).filter(Boolean) as Tag[];
  };

  // カテゴリ別タグ選択モーダル
  const CategoryTagSelector = () => (
    <Modal opened={opened} onClose={close} title="タグ選択" size="lg">
      <Stack gap="md">
        {categories.map((category) => (
          <Card key={category.id} padding="md" withBorder>
            <Stack gap="sm">
              <Group gap="xs">
                <Box w={12} h={12} bg={category.color} style={{ borderRadius: 2 }} />
                <Text fw={500} c={category.color}>{category.name}</Text>
              </Group>
              
              <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="xs">
                {category.tags.map((tag) => {
                  const isSelected = selectedTags.includes(tag.id);
                  return (
                    <Badge
                      key={tag.id}
                      size="md"
                      variant={isSelected ? "filled" : "light"}
                      style={{ 
                        cursor: 'pointer',
                        backgroundColor: isSelected ? tag.color : `${tag.color}15`,
                        color: isSelected ? '#fff' : tag.color,
                      }}
                      onClick={() => {
                        if (isSelected) {
                          onChange(selectedTags.filter(id => id !== tag.id));
                        } else {
                          onChange([...selectedTags, tag.id]);
                        }
                      }}
                    >
                      {tag.name}
                    </Badge>
                  );
                })}
              </SimpleGrid>
            </Stack>
          </Card>
        ))}
        
        <Group justify="flex-end">
          <Button onClick={close}>完了</Button>
        </Group>
      </Stack>
    </Modal>
  );

  return (
    <Box>
      <Group justify="space-between" mb="xs">
        <Text size="sm" fw={500}>{label}</Text>
        <Button 
          size="xs" 
          variant="light" 
          leftSection={<IconPlus size={12} />}
          onClick={open}
        >
          カテゴリ別選択
        </Button>
      </Group>
      
      <MultiSelect
        placeholder={placeholder}
        data={tagOptions}
        value={selectedTags}
        onChange={onChange}
        searchable
        clearable
        renderOption={({ option }) => {
          const tag = allTags.find(t => t.id === option.value);
          return (
            <Group gap="xs">
              <Box w={8} h={8} bg={tag?.color || '#gray'} style={{ borderRadius: '50%' }} />
              <Text>{option.label}</Text>
            </Group>
          );
        }}
      />
      
      {/* 選択されたタグの表示 */}
      {selectedTags.length > 0 && (
        <Group gap="xs" mt="xs">
          {getSelectedTagDetails().map((tag) => (
            <Badge
              key={tag.id}
              size="sm"
              variant="light"
              style={{ 
                backgroundColor: `${tag.color}15`, 
                color: tag.color 
              }}
            >
              {tag.name}
            </Badge>
          ))}
        </Group>
      )}
      
      <CategoryTagSelector />
    </Box>
  );
}

// タグ表示専用コンポーネント
interface TagDisplayProps {
  tagIds: string[];
  categories?: TagCategory[];
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function TagDisplay({ tagIds, categories = defaultCategories, size = 'sm' }: TagDisplayProps) {
  const allTags = categories.flatMap(category => category.tags);
  const tags = tagIds.map(tagId => allTags.find(tag => tag.id === tagId)).filter(Boolean) as Tag[];

  if (tags.length === 0) return null;

  return (
    <Group gap="xs">
      {tags.map((tag) => (
        <Badge
          key={tag.id}
          size={size}
          variant="light"
          style={{ 
            backgroundColor: `${tag.color}15`, 
            color: tag.color 
          }}
        >
          {tag.name}
        </Badge>
      ))}
    </Group>
  );
}

// タグカテゴリをエクスポート（他のコンポーネントで使用）
export { defaultCategories };
export type { Tag, TagCategory };
