'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Center,
  ColorInput,
  Container,
  Divider,
  Group,
  Loader,
  Modal,
  MultiSelect,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Tabs,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import {
  IconArrowDown,
  IconArrowUp,
  IconInfoCircle,
  IconPencil,
  IconPlus,
  IconTag,
  IconTrash,
  IconWand,
} from '@tabler/icons-react';

import { PageTitle } from '@/components/PageTitle';
import {
  useCreateTag,
  useCreateTagCategory,
  useCreateTagGroup,
  useDeleteTag,
  useDeleteTagCategory,
  useDeleteTagGroup,
  useGetTagCategories,
  useReorderTagCategories,
  useReorderTagGroups,
  useReorderTags,
  useUpdateTag,
  useUpdateTagCategory,
  useUpdateTagGroup,
  type CreateTagCategoryRequest,
  type CreateTagGroupRequest,
  type CreateTagRequest,
  type TagCategoryFilters,
  type TagCategoryView,
  type TagGroupView,
  type TagView,
  type UpdateTagCategoryRequest,
  type UpdateTagGroupRequest,
  type UpdateTagRequest,
} from '@/lib/api/hooks/use-tags';

const PRESET_COLORS = [
  '#e74c3c',
  '#e67e22',
  '#f39c12',
  '#f1c40f',
  '#2ecc71',
  '#1abc9c',
  '#3498db',
  '#9b59b6',
  '#34495e',
  '#95a5a6',
];

const DEFAULT_CATEGORY_COLOR = '#6366F1';
const DEFAULT_TAG_COLOR = '#3B82F6';

type CategoryFormValues = {
  key: string;
  name: string;
  description: string;
  color: string;
  scopes: string[];
  isActive: boolean;
};

type TagFormValues = {
  name: string;
  categoryId: string;
  groupId: string;
  description: string;
  color: string;
  allowsManual: boolean;
  allowsAutomation: boolean;
  isActive: boolean;
};

type GroupFormValues = {
  categoryId: string;
  name: string;
  description: string;
  isActive: boolean;
};

type AutomationMeta = {
  ruleName?: string;
  reason?: string;
  source?: string;
  assignedAt?: string;
};

function sortCategories(categories: TagCategoryView[]): TagCategoryView[] {
  return [...categories].sort((a, b) => {
    const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
    if (orderA === orderB) {
      return a.name.localeCompare(b.name, 'ja');
    }
    return orderA - orderB;
  });
}

function sortGroups(groups?: TagGroupView[] | null): TagGroupView[] {
  return [...(groups ?? [])].sort((a, b) => {
    const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
    if (orderA === orderB) {
      return a.name.localeCompare(b.name, 'ja');
    }
    return orderA - orderB;
  });
}

function sortTags(tags?: TagView[] | null): TagView[] {
  return [...(tags ?? [])].sort((a, b) => {
    const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
    if (orderA === orderB) {
      return a.name.localeCompare(b.name, 'ja');
    }
    return orderA - orderB;
  });
}

function extractAutomationMeta(tag: TagView): AutomationMeta | null {
  if (!tag.metadata || typeof tag.metadata !== 'object') {
    return null;
  }

  const metadata = tag.metadata as Record<string, unknown>;
  const automation = metadata.automation;

  if (!automation || typeof automation !== 'object') {
    return null;
  }

  const info = automation as Record<string, unknown>;

  const meta: AutomationMeta = {
    ruleName: typeof info.ruleName === 'string' ? info.ruleName : undefined,
    reason: typeof info.reason === 'string' ? info.reason : undefined,
    source: typeof info.source === 'string' ? info.source : undefined,
    assignedAt: typeof info.assignedAt === 'string' ? info.assignedAt : undefined,
  };

  return Object.values(meta).some(Boolean) ? meta : null;
}

function AutomationIndicator({ tag }: { tag: TagView }) {
  const meta = extractAutomationMeta(tag);
  if (!meta && !tag.allowsAutomation) {
    return null;
  }

  const tooltipParts = [meta?.ruleName, meta?.reason, meta?.source, meta?.assignedAt].filter(Boolean);
  if (!meta && tag.allowsAutomation && !tag.allowsManual) {
    tooltipParts.push('自動付与専用タグ');
  }
  if (!meta && tag.allowsAutomation && tooltipParts.length === 0) {
    tooltipParts.push('自動付与ルールで使用可能');
  }

  const content = (
    <Group gap={4} align="center" wrap="nowrap" style={{ fontSize: 11 }}>
      <IconWand size={12} />
      <Text span>{meta ? '自動' : '自動可'}</Text>
    </Group>
  );

  return (
    <Tooltip label={tooltipParts.join(' / ')} withArrow multiline withinPortal>
      {content}
    </Tooltip>
  );
}

function buildCategoryPayload(values: CategoryFormValues): CreateTagCategoryRequest {
  const payload: CreateTagCategoryRequest = {
    name: values.name,
    ...(values.key ? { key: values.key } : {}),
    ...(values.description ? { description: values.description } : {}),
    ...(values.color ? { color: values.color } : {}),
    ...(values.scopes.length ? { scopes: values.scopes } : { scopes: [] }),
    isActive: values.isActive,
  };
  return payload;
}

function buildTagPayload(values: TagFormValues): CreateTagRequest {
  const payload: CreateTagRequest = {
    name: values.name,
    groupId: values.groupId,
    ...(values.description ? { description: values.description } : {}),
    ...(values.color ? { color: values.color } : {}),
    allowsManual: values.allowsManual,
    allowsAutomation: values.allowsAutomation,
    isActive: values.isActive,
  };
  return payload;
}

export default function TagsPage() {
  const [filters, setFilters] = useState<{ scopes: string[]; includeInactive: boolean }>({
    scopes: [],
    includeInactive: false,
  });
  const [scopeDraft, setScopeDraft] = useState('');
  const [editingCategory, setEditingCategory] = useState<TagCategoryView | null>(null);
  const [editingGroup, setEditingGroup] = useState<{ category: TagCategoryView; group: TagGroupView } | null>(null);
  const [editingTag, setEditingTag] = useState<{ category: TagCategoryView; group: TagGroupView; tag: TagView } | null>(null);
  const [categoryModalOpened, { open: openCategoryModal, close: closeCategoryModal }] = useDisclosure(false);
  const [groupModalOpened, { open: openGroupModal, close: closeGroupModal }] = useDisclosure(false);
  const [tagModalOpened, { open: openTagModal, close: closeTagModal }] = useDisclosure(false);

  const queryFilters = useMemo<TagCategoryFilters | undefined>(() => {
    const payload: TagCategoryFilters = {};
    if (filters.scopes.length) {
      payload.scope = filters.scopes;
    }
    if (filters.includeInactive) {
      payload.includeInactive = true;
    }
    return Object.keys(payload).length ? payload : undefined;
  }, [filters]);

  const { data, isLoading, isFetching } = useGetTagCategories(queryFilters, {
    placeholderData: (previousData) => previousData,
  });

  const categories = useMemo(() => data?.data ?? [], [data]);
  const sortedCategories = useMemo(() => sortCategories(categories), [categories]);
  const availableScopes = useMemo(() => {
    const set = new Set<string>();
    categories.forEach((category) => {
      category.scopes.forEach((scope) => {
        if (scope) {
          set.add(scope);
        }
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ja'));
  }, [categories]);

  const categoryForm = useForm<CategoryFormValues>({
    initialValues: {
      key: '',
      name: '',
      description: '',
      color: DEFAULT_CATEGORY_COLOR,
      scopes: [],
      isActive: true,
    },
    validate: {
      name: (value) => (value.trim().length ? null : 'カテゴリ名を入力してください'),
    },
  });

  const tagForm = useForm<TagFormValues>({
    initialValues: {
      name: '',
      categoryId: '',
      groupId: '',
      description: '',
      color: DEFAULT_TAG_COLOR,
      allowsManual: true,
      allowsAutomation: true,
      isActive: true,
    },
    validate: {
      name: (value) => (value.trim().length ? null : 'タグ名を入力してください'),
      categoryId: (value) => (value ? null : 'カテゴリを選択してください'),
      groupId: (value) => (value ? null : 'タググループを選択してください'),
    },
  });

  const groupForm = useForm<GroupFormValues>({
    initialValues: {
      categoryId: '',
      name: '',
      description: '',
      isActive: true,
    },
    validate: {
      categoryId: (value) => (value ? null : 'カテゴリを選択してください'),
      name: (value) => (value.trim().length ? null : 'グループ名を入力してください'),
    },
  });

  const categoryScopeOptions = useMemo(() => {
    const set = new Set<string>([
      ...availableScopes,
      ...filters.scopes,
      ...categoryForm.values.scopes,
      scopeDraft,
    ]);
    return Array.from(set)
      .filter((scope) => scope.trim().length > 0)
      .map((scope) => ({ value: scope, label: scope }));
  }, [availableScopes, categoryForm.values.scopes, filters.scopes, scopeDraft]);

  const filterScopeOptions = useMemo(
    () => availableScopes.map((scope) => ({ value: scope, label: scope })),
    [availableScopes],
  );

  const categoryOptions = useMemo(
    () => sortedCategories.map((category) => ({ value: category.id, label: category.name })),
    [sortedCategories],
  );

  const groupOptionsByCategory = useMemo(() => {
    const map = new Map<string, { value: string; label: string }[]>();
    sortedCategories.forEach((category) => {
      map.set(
        category.id,
        sortGroups(category.groups).map((group) => ({ value: group.id, label: group.name })),
      );
    });
    return map;
  }, [sortedCategories]);

  const tagGroupOptions = useMemo(() => {
    if (!tagForm.values.categoryId) {
      return [];
    }
    return groupOptionsByCategory.get(tagForm.values.categoryId) ?? [];
  }, [groupOptionsByCategory, tagForm.values.categoryId]);

  useEffect(() => {
    if (!tagModalOpened) {
      return;
    }
    if (!tagForm.values.categoryId) {
      tagForm.setFieldValue('groupId', '');
      return;
    }

    if (!tagForm.values.groupId && tagGroupOptions.length === 1) {
      tagForm.setFieldValue('groupId', tagGroupOptions[0].value);
    }
  }, [tagModalOpened, tagForm, tagGroupOptions]);

  const createCategory = useCreateTagCategory();
  const updateCategory = useUpdateTagCategory();
  const deleteCategory = useDeleteTagCategory();
  const reorderCategoriesMutation = useReorderTagCategories();
  const createGroup = useCreateTagGroup();
  const updateGroup = useUpdateTagGroup();
  const deleteGroup = useDeleteTagGroup();
  const reorderGroupsMutation = useReorderTagGroups();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();
  const reorderTagsMutation = useReorderTags();

  const isCategorySubmitting = createCategory.isPending || updateCategory.isPending;
  const isGroupSubmitting = createGroup.isPending || updateGroup.isPending;
  const isTagSubmitting = createTag.isPending || updateTag.isPending;
  const isAnyMutationPending =
    isCategorySubmitting ||
    isGroupSubmitting ||
    isTagSubmitting ||
    deleteCategory.isPending ||
    deleteGroup.isPending ||
    deleteTag.isPending ||
    reorderCategoriesMutation.isPending ||
    reorderGroupsMutation.isPending ||
    reorderTagsMutation.isPending;

  const flatTags = useMemo(() => {
    return sortedCategories.flatMap((category) =>
      sortGroups(category.groups).flatMap((group) =>
        sortTags(group.tags).map((tag) => ({ category, group, tag })),
      ),
    );
  }, [sortedCategories]);

  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    categoryForm.setValues({
      key: '',
      name: '',
      description: '',
      color: DEFAULT_CATEGORY_COLOR,
      scopes: [],
      isActive: true,
    });
    setScopeDraft('');
    openCategoryModal();
  };

  const handleEditCategory = (category: TagCategoryView) => {
    setEditingCategory(category);
    categoryForm.setValues({
      key: category.key ?? '',
      name: category.name,
      description: category.description ?? '',
      color: category.color ?? DEFAULT_CATEGORY_COLOR,
      scopes: category.scopes ?? [],
      isActive: category.isActive,
    });
    setScopeDraft('');
    openCategoryModal();
  };

  const handleOpenCreateGroup = (categoryId?: string) => {
    setEditingGroup(null);
    groupForm.setValues({
      categoryId: categoryId ?? '',
      name: '',
      description: '',
      isActive: true,
    });
    openGroupModal();
  };

  const handleEditGroup = (category: TagCategoryView, group: TagGroupView) => {
    setEditingGroup({ category, group });
    groupForm.setValues({
      categoryId: category.id,
      name: group.name,
      description: group.description ?? '',
      isActive: group.isActive,
    });
    openGroupModal();
  };

  const handleSubmitGroup = groupForm.onSubmit(async (values) => {
    const payload: CreateTagGroupRequest = {
      categoryId: values.categoryId,
      name: values.name,
      ...(values.description ? { description: values.description } : {}),
      isActive: values.isActive,
    };

    try {
      if (editingGroup) {
        await updateGroup.mutateAsync({
          id: editingGroup.group.id,
          payload: payload as UpdateTagGroupRequest,
        });
      } else {
        await createGroup.mutateAsync(payload);
      }
      closeGroupModal();
    } catch {
      // noop
    }
  });

  const handleDeleteGroupAction = async (id: string) => {
    if (!window.confirm('このタググループと関連タグを削除しますか？')) {
      return;
    }
    try {
      await deleteGroup.mutateAsync(id);
    } catch {
      // noop
    }
  };

  const handleGroupMove = async (categoryId: string, groupId: string, direction: 'up' | 'down') => {
    const category = sortedCategories.find((item) => item.id === categoryId);
    if (!category) {
      return;
    }

    const orderedGroups = sortGroups(category.groups);
    const currentIndex = orderedGroups.findIndex((group) => group.id === groupId);
    if (currentIndex === -1) {
      return;
    }

    const targetIndex = currentIndex + (direction === 'up' ? -1 : 1);
    if (targetIndex < 0 || targetIndex >= orderedGroups.length) {
      return;
    }

    const [moved] = orderedGroups.splice(currentIndex, 1);
    orderedGroups.splice(targetIndex, 0, moved);

    try {
      await reorderGroupsMutation.mutateAsync({
        items: orderedGroups.map((group, orderIndex) => ({
          id: group.id,
          displayOrder: orderIndex,
          categoryId,
        })),
      });
    } catch {
      // noop
    }
  };

  const handleOpenCreateTag = (categoryId?: string, groupId?: string) => {
    setEditingTag(null);
    tagForm.setValues({
      name: '',
      categoryId: categoryId ?? '',
      groupId: groupId ?? '',
      description: '',
      color: DEFAULT_TAG_COLOR,
      allowsManual: true,
      allowsAutomation: true,
      isActive: true,
    });
    openTagModal();
  };

  const handleEditTag = (category: TagCategoryView, group: TagGroupView, tag: TagView) => {
    setEditingTag({ category, group, tag });
    tagForm.setValues({
      name: tag.name,
      categoryId: category.id,
      groupId: group.id,
      description: tag.description ?? '',
      color: tag.color ?? DEFAULT_TAG_COLOR,
      allowsManual: tag.allowsManual,
      allowsAutomation: tag.allowsAutomation,
      isActive: tag.isActive,
    });
    openTagModal();
  };

  const handleSubmitCategory = categoryForm.onSubmit(async (values) => {
    const payload = buildCategoryPayload(values);
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, payload: payload as UpdateTagCategoryRequest });
      } else {
        await createCategory.mutateAsync(payload);
      }
      closeCategoryModal();
    } catch {
      // エラーハンドリングはミューテーション側の通知に委譲
    }
  });

  const handleSubmitTag = tagForm.onSubmit(async (values) => {
    const payload = buildTagPayload(values);
    try {
      if (editingTag) {
        await updateTag.mutateAsync({ id: editingTag.tag.id, payload: payload as UpdateTagRequest });
      } else {
        await createTag.mutateAsync(payload);
      }
      closeTagModal();
    } catch {
      // 通知はミューテーション側で実施
    }
  });

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('このカテゴリと関連タグを削除しますか？')) {
      return;
    }
    try {
      await deleteCategory.mutateAsync(id);
    } catch {
      // noop
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (!window.confirm('このタグを削除しますか？')) {
      return;
    }
    try {
      await deleteTag.mutateAsync(id);
    } catch {
      // noop
    }
  };

  const handleCategoryMove = async (index: number, direction: 'up' | 'down') => {
    const ordered = [...sortedCategories];
    const targetIndex = index + (direction === 'up' ? -1 : 1);
    if (targetIndex < 0 || targetIndex >= ordered.length) {
      return;
    }
    const [moved] = ordered.splice(index, 1);
    ordered.splice(targetIndex, 0, moved);
    try {
      await reorderCategoriesMutation.mutateAsync({
        items: ordered.map((category, orderIndex) => ({
          id: category.id,
          displayOrder: orderIndex,
        })),
      });
    } catch {
      // noop
    }
  };

  const handleTagMove = async (groupId: string, tagId: string, direction: 'up' | 'down') => {
    const category = sortedCategories.find((item) => item.groups.some((group) => group.id === groupId));
    if (!category) {
      return;
    }

    const targetGroup = sortGroups(category.groups).find((group) => group.id === groupId);
    if (!targetGroup) {
      return;
    }

    const orderedTags = sortTags(targetGroup.tags);
    const currentIndex = orderedTags.findIndex((tag) => tag.id === tagId);
    if (currentIndex === -1) {
      return;
    }
    const targetIndex = currentIndex + (direction === 'up' ? -1 : 1);
    if (targetIndex < 0 || targetIndex >= orderedTags.length) {
      return;
    }

    const [moved] = orderedTags.splice(currentIndex, 1);
    orderedTags.splice(targetIndex, 0, moved);

    try {
      await reorderTagsMutation.mutateAsync({
        items: orderedTags.map((tag, orderIndex) => ({
          id: tag.id,
          displayOrder: orderIndex,
          groupId,
        })),
      });
    } catch {
      // noop
    }
  };

  const handleScopeDraftSubmit = () => {
    const value = scopeDraft.trim();
    if (!value) {
      return;
    }
    if (!categoryForm.values.scopes.includes(value)) {
      categoryForm.setFieldValue('scopes', [...categoryForm.values.scopes, value]);
    }
    setScopeDraft('');
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <PageTitle>タグ管理</PageTitle>
          <Group gap="sm" wrap="wrap">
            <Button
              leftSection={<IconPlus size={16} />}
              variant="outline"
              size="sm"
              onClick={handleOpenCreateCategory}
              disabled={isAnyMutationPending}
            >
              カテゴリ追加
            </Button>
            <Button
              leftSection={<IconPlus size={16} />}
              variant="outline"
              size="sm"
              onClick={() => handleOpenCreateGroup()}
              disabled={sortedCategories.length === 0 || isAnyMutationPending}
            >
              グループ追加
            </Button>
            <Button
              leftSection={<IconTag size={16} />}
              size="sm"
              onClick={() => handleOpenCreateTag()}
              disabled={sortedCategories.length === 0 || isAnyMutationPending}
            >
              タグ追加
            </Button>
          </Group>
        </Group>

        <Alert icon={<IconInfoCircle size={18} />} variant="light">
          タグはカテゴリごとに整理され、カテゴリ単位でスコープ（利用ページ）やアクティブ状態を制御できます。並び替えや編集内容は保存すると即座にDBへ反映されます。
        </Alert>

        <Card withBorder padding="md" radius="md">
          <Group justify="space-between" align="center" wrap="wrap">
            <Group gap="md" wrap="wrap">
              <MultiSelect
                label="スコープフィルタ"
                data={filterScopeOptions}
                value={filters.scopes}
                onChange={(value) => setFilters((prev) => ({ ...prev, scopes: value }))}
                placeholder={filterScopeOptions.length ? 'スコープを選択' : '利用可能なスコープがありません'}
                searchable
                clearable
                nothingFoundMessage="スコープが見つかりません"
                size="sm"
                maxDropdownHeight={200}
                w={260}
              />
              <Switch
                label="非アクティブを含める"
                checked={filters.includeInactive}
                onChange={(event) => {
                  const checked = event.currentTarget?.checked ?? false;
                  setFilters((prev) => ({ ...prev, includeInactive: checked }));
                }}
              />
            </Group>
            {isFetching && <Loader size="sm" />}
          </Group>
        </Card>

        <Tabs defaultValue="categories" keepMounted={false} radius="md">
          <Tabs.List>
            <Tabs.Tab value="categories">カテゴリ</Tabs.Tab>
            <Tabs.Tab value="tags">タグ一覧</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="categories" pt="lg">
            {isLoading ? (
              <Center py="xl">
                <Loader />
              </Center>
            ) : sortedCategories.length === 0 ? (
              <Center py="xl">
                <Text c="dimmed">カテゴリが見つかりません。新規作成してください。</Text>
              </Center>
            ) : (
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                {sortedCategories.map((category, index) => {
                  const groups = sortGroups(category.groups);
                  const totalTags = groups.reduce((sum, group) => sum + group.tags.length, 0);
                  return (
                    <Card key={category.id} withBorder padding="lg" radius="md" shadow="sm">
                      <Stack gap="md">
                        <Group justify="space-between" align="flex-start">
                          <Stack gap={4}>
                            <Group gap="xs" align="center">
                              <Badge color="gray" variant="light">{index + 1}</Badge>
                              <Text fw={600} size="lg">
                                {category.name}
                              </Text>
                              {!category.isActive && (
                                <Badge color="gray" variant="outline" size="sm">
                                  非アクティブ
                                </Badge>
                              )}
                            </Group>
                            <Text size="sm" c="dimmed">
                              {category.description || '説明が設定されていません'}
                            </Text>
                            <Group gap="xs" wrap="wrap">
                              <Badge
                                variant="light"
                                style={{
                                  backgroundColor: `${(category.color ?? DEFAULT_CATEGORY_COLOR)}1A`,
                                  color: category.color ?? DEFAULT_CATEGORY_COLOR,
                                }}
                              >
                                表示色 {category.color ?? DEFAULT_CATEGORY_COLOR}
                              </Badge>
                              <Badge variant="outline">グループ数 {groups.length}</Badge>
                              <Badge variant="outline">タグ数 {totalTags}</Badge>
                              {category.scopes.length > 0 ? (
                                category.scopes.map((scope) => (
                                  <Badge key={scope} variant="dot">
                                    {scope}
                                  </Badge>
                                ))
                              ) : (
                                <Badge variant="dot" color="gray">
                                  スコープ未設定
                                </Badge>
                              )}
                            </Group>
                          </Stack>
                          <Stack gap={6} align="flex-end">
                            <Group gap={4}>
                              <ActionIcon
                                variant="subtle"
                                aria-label="上へ移動"
                                onClick={() => void handleCategoryMove(index, 'up')}
                                disabled={index === 0 || reorderCategoriesMutation.isPending}
                              >
                                <IconArrowUp size={16} />
                              </ActionIcon>
                              <ActionIcon
                                variant="subtle"
                                aria-label="下へ移動"
                                onClick={() => void handleCategoryMove(index, 'down')}
                                disabled={index === sortedCategories.length - 1 || reorderCategoriesMutation.isPending}
                              >
                                <IconArrowDown size={16} />
                              </ActionIcon>
                            </Group>
                            <Group gap={6}>
                              <ActionIcon
                                variant="light"
                                aria-label="カテゴリを編集"
                                onClick={() => handleEditCategory(category)}
                                disabled={isAnyMutationPending}
                              >
                                <IconPencil size={16} />
                              </ActionIcon>
                              <ActionIcon
                                variant="light"
                                color="red"
                                aria-label="カテゴリを削除"
                                onClick={() => void handleDeleteCategory(category.id)}
                                disabled={deleteCategory.isPending}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Group>
                          </Stack>
                        </Group>

                        <Divider />

                        <Stack gap="sm">
                          <Group justify="space-between" align="center">
                            <Text fw={500}>タググループ</Text>
                            <Button
                              size="xs"
                              variant="light"
                              leftSection={<IconPlus size={12} />}
                              onClick={() => handleOpenCreateGroup(category.id)}
                              disabled={isAnyMutationPending}
                            >
                              グループ追加
                            </Button>
                          </Group>

                          {groups.length === 0 ? (
                            <Text size="sm" c="dimmed">
                              このカテゴリにはまだタググループがありません。
                            </Text>
                          ) : (
                            <Stack gap="sm">
                              {groups.map((group, groupIndex) => {
                                const tags = sortTags(group.tags);
                                return (
                                  <Card key={group.id} withBorder radius="sm" padding="md" shadow="xs">
                                    <Stack gap="sm">
                                      <Group justify="space-between" align="flex-start">
                                        <Stack gap={4}>
                                          <Group gap="xs" align="center">
                                            <Badge color="gray" variant="light" size="sm">
                                              {groupIndex + 1}
                                            </Badge>
                                            <Text fw={500}>{group.name}</Text>
                                            {!group.isActive && (
                                              <Badge size="xs" color="gray" variant="outline">
                                                非アクティブ
                                              </Badge>
                                            )}
                                            <Badge size="xs" variant="outline">
                                              タグ {tags.length}
                                            </Badge>
                                          </Group>
                                          {group.description && (
                                            <Text size="xs" c="dimmed">
                                              {group.description}
                                            </Text>
                                          )}
                                        </Stack>
                                        <Stack gap={6} align="flex-end">
                                          <Group gap={4}>
                                            <ActionIcon
                                              variant="subtle"
                                              aria-label="上へ移動"
                                              onClick={() => void handleGroupMove(category.id, group.id, 'up')}
                                              disabled={groupIndex === 0 || reorderGroupsMutation.isPending}
                                            >
                                              <IconArrowUp size={14} />
                                            </ActionIcon>
                                            <ActionIcon
                                              variant="subtle"
                                              aria-label="下へ移動"
                                              onClick={() => void handleGroupMove(category.id, group.id, 'down')}
                                              disabled={groupIndex === groups.length - 1 || reorderGroupsMutation.isPending}
                                            >
                                              <IconArrowDown size={14} />
                                            </ActionIcon>
                                          </Group>
                                          <Group gap={6}>
                                            <ActionIcon
                                              variant="light"
                                              aria-label="グループを編集"
                                              onClick={() => handleEditGroup(category, group)}
                                              disabled={isAnyMutationPending}
                                            >
                                              <IconPencil size={14} />
                                            </ActionIcon>
                                            <ActionIcon
                                              variant="light"
                                              color="red"
                                              aria-label="グループを削除"
                                              onClick={() => void handleDeleteGroupAction(group.id)}
                                              disabled={deleteGroup.isPending}
                                            >
                                              <IconTrash size={14} />
                                            </ActionIcon>
                                          </Group>
                                        </Stack>
                                      </Group>

                                      <Group justify="flex-end">
                                        <Button
                                          size="xs"
                                          variant="light"
                                          leftSection={<IconPlus size={12} />}
                                          onClick={() => handleOpenCreateTag(category.id, group.id)}
                                          disabled={isAnyMutationPending}
                                        >
                                          タグ追加
                                        </Button>
                                      </Group>

                                      {tags.length === 0 ? (
                                        <Text size="sm" c="dimmed">
                                          このグループにはまだタグがありません。
                                        </Text>
                                      ) : (
                                        <Stack gap="xs">
                                          {tags.map((tag, tagIndex) => (
                                            <Card key={tag.id} withBorder radius="sm" padding="sm">
                                              <Group justify="space-between" align="center">
                                                <Stack gap={4} flex={1}>
                                                  <Group gap="xs" align="center">
                                                    <Badge color="gray" variant="light" size="sm">
                                                      {tagIndex + 1}
                                                    </Badge>
                                                    <Text fw={500} size="sm">
                                                      {tag.name}
                                                    </Text>
                                                    {!tag.isActive && (
                                                      <Badge size="xs" color="gray" variant="outline">
                                                        非アクティブ
                                                      </Badge>
                                                    )}
                                                    <Badge size="xs" variant="outline">
                                                      使用 {tag.usageCount.toLocaleString()}回
                                                    </Badge>
                                                    <AutomationIndicator tag={tag} />
                                                  </Group>
                                                  {tag.description && (
                                                    <Text size="xs" c="dimmed">
                                                      {tag.description}
                                                    </Text>
                                                  )}
                                                </Stack>
                                                <Group gap={4}>
                                                  <ActionIcon
                                                    variant="subtle"
                                                    aria-label="上へ移動"
                                                    onClick={() => void handleTagMove(group.id, tag.id, 'up')}
                                                    disabled={tagIndex === 0 || reorderTagsMutation.isPending}
                                                  >
                                                    <IconArrowUp size={14} />
                                                  </ActionIcon>
                                                  <ActionIcon
                                                    variant="subtle"
                                                    aria-label="下へ移動"
                                                    onClick={() => void handleTagMove(group.id, tag.id, 'down')}
                                                    disabled={tagIndex === tags.length - 1 || reorderTagsMutation.isPending}
                                                  >
                                                    <IconArrowDown size={14} />
                                                  </ActionIcon>
                                                  <ActionIcon
                                                    variant="light"
                                                    aria-label="タグを編集"
                                                    onClick={() => handleEditTag(category, group, tag)}
                                                    disabled={isAnyMutationPending}
                                                  >
                                                    <IconPencil size={14} />
                                                  </ActionIcon>
                                                  <ActionIcon
                                                    variant="light"
                                                    color="red"
                                                    aria-label="タグを削除"
                                                    onClick={() => void handleDeleteTag(tag.id)}
                                                    disabled={deleteTag.isPending}
                                                  >
                                                    <IconTrash size={14} />
                                                  </ActionIcon>
                                                </Group>
                                              </Group>
                                            </Card>
                                          ))}
                                        </Stack>
                                      )}
                                    </Stack>
                                  </Card>
                                );
                              })}
                            </Stack>
                          )}
                        </Stack>
                      </Stack>
                    </Card>
                  );
                })}
              </SimpleGrid>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="tags" pt="lg">
            {isLoading ? (
              <Center py="xl">
                <Loader />
              </Center>
            ) : flatTags.length === 0 ? (
              <Center py="xl">
                <Text c="dimmed">表示できるタグがありません。</Text>
              </Center>
            ) : (
              <Stack gap="sm">
                {flatTags.map(({ category, group, tag }) => (
                  <Card key={tag.id} withBorder radius="md" padding="md">
                    <Group justify="space-between" align="flex-start">
                      <Stack gap={4}>
                        <Group gap="xs" align="center">
                          <Badge
                            variant="light"
                            style={{
                              backgroundColor: `${(category.color ?? DEFAULT_CATEGORY_COLOR)}1A`,
                              color: category.color ?? DEFAULT_CATEGORY_COLOR,
                            }}
                          >
                            {category.name}
                          </Badge>
                          <Badge variant="light" color="gray">
                            {group.name}
                          </Badge>
                          <Text fw={500}>{tag.name}</Text>
                          {!tag.isActive && (
                            <Badge size="xs" color="gray" variant="outline">
                              非アクティブ
                            </Badge>
                          )}
                          <AutomationIndicator tag={tag} />
                        </Group>
                        <Group gap="xs">
                          <Badge size="xs" variant="outline">
                            使用 {tag.usageCount.toLocaleString()}回
                          </Badge>
                          <Badge size="xs" variant="outline">
                            手動 {tag.allowsManual ? '可' : '不可'}
                          </Badge>
                          <Badge size="xs" variant="outline">
                            自動 {tag.allowsAutomation ? '可' : '不可'}
                          </Badge>
                        </Group>
                        {tag.description && (
                          <Text size="sm" c="dimmed">
                            {tag.description}
                          </Text>
                        )}
                      </Stack>
                      <Group gap={6}>
                        <Button
                          size="xs"
                          variant="light"
                          onClick={() => handleEditTag(category, group, tag)}
                          disabled={isAnyMutationPending}
                        >
                          編集
                        </Button>
                        <Button size="xs" color="red" variant="light" onClick={() => void handleDeleteTag(tag.id)} disabled={deleteTag.isPending}>
                          削除
                        </Button>
                      </Group>
                    </Group>
                  </Card>
                ))}
              </Stack>
            )}
          </Tabs.Panel>
        </Tabs>

        <Modal
          opened={categoryModalOpened}
          onClose={() => {
            closeCategoryModal();
            setEditingCategory(null);
            setScopeDraft('');
          }}
          title={editingCategory ? 'カテゴリを編集' : 'カテゴリを追加'}
          size="lg"
          keepMounted={false}
        >
          <Box component="form" onSubmit={handleSubmitCategory}>
            <Stack gap="md">
              <TextInput
                label="キー"
                description="URLなどで利用する識別子（未入力の場合は自動生成）"
                value={categoryForm.values.key}
                onChange={(event) => categoryForm.setFieldValue('key', event.currentTarget.value)}
              />
              <TextInput
                label="カテゴリ名"
                required
                value={categoryForm.values.name}
                onChange={(event) => categoryForm.setFieldValue('name', event.currentTarget.value)}
                error={categoryForm.errors.name}
              />
              <TextInput
                label="説明"
                placeholder="カテゴリの用途や対象を記載"
                value={categoryForm.values.description}
                onChange={(event) => categoryForm.setFieldValue('description', event.currentTarget.value)}
              />
              <ColorInput
                label="カラー"
                swatches={PRESET_COLORS}
                value={categoryForm.values.color}
                onChange={(value) => categoryForm.setFieldValue('color', value || DEFAULT_CATEGORY_COLOR)}
              />
              <MultiSelect
                label="スコープ"
                data={categoryScopeOptions}
                value={categoryForm.values.scopes}
                onChange={(value) => categoryForm.setFieldValue('scopes', value)}
                placeholder="このカテゴリを使用する画面や機能"
                searchable
                clearable
                maxDropdownHeight={220}
              />
              <Group align="flex-end" gap="sm">
                <TextInput
                  label="スコープを追加"
                  placeholder="新しいスコープ名"
                  value={scopeDraft}
                  onChange={(event) => setScopeDraft(event.currentTarget.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleScopeDraftSubmit();
                    }
                  }}
                  style={{ flex: 1 }}
                />
                <Button
                  variant="light"
                  onClick={handleScopeDraftSubmit}
                  disabled={!scopeDraft.trim() || categoryForm.values.scopes.includes(scopeDraft.trim())}
                >
                  追加
                </Button>
              </Group>
              <Switch
                label="アクティブ"
                checked={categoryForm.values.isActive}
                onChange={(event) => categoryForm.setFieldValue('isActive', event.currentTarget.checked)}
              />
              <Group justify="flex-end" gap="sm">
                <Button variant="outline" onClick={closeCategoryModal}>
                  キャンセル
                </Button>
                <Button type="submit" loading={isCategorySubmitting}>
                  {editingCategory ? '更新' : '作成'}
                </Button>
              </Group>
            </Stack>
          </Box>
        </Modal>

        <Modal
          opened={groupModalOpened}
          onClose={() => {
            closeGroupModal();
            setEditingGroup(null);
          }}
          title={editingGroup ? 'タググループを編集' : 'タググループを追加'}
          size="lg"
          keepMounted={false}
        >
          <Box component="form" onSubmit={handleSubmitGroup}>
            <Stack gap="md">
              <Select
                label="カテゴリ"
                data={categoryOptions}
                value={groupForm.values.categoryId}
                onChange={(value) => groupForm.setFieldValue('categoryId', value ?? '')}
                error={groupForm.errors.categoryId}
                required
              />
              <TextInput
                label="グループ名"
                value={groupForm.values.name}
                onChange={(event) => groupForm.setFieldValue('name', event.currentTarget.value)}
                error={groupForm.errors.name}
                required
              />
              <TextInput
                label="説明"
                placeholder="タググループの用途"
                value={groupForm.values.description}
                onChange={(event) => groupForm.setFieldValue('description', event.currentTarget.value)}
              />
              <Switch
                label="アクティブ"
                checked={groupForm.values.isActive}
                onChange={(event) => groupForm.setFieldValue('isActive', event.currentTarget.checked)}
              />
              <Group justify="flex-end" gap="sm">
                <Button variant="outline" onClick={closeGroupModal}>
                  キャンセル
                </Button>
                <Button type="submit" loading={isGroupSubmitting}>
                  {editingGroup ? '更新' : '作成'}
                </Button>
              </Group>
            </Stack>
          </Box>
        </Modal>

        <Modal
          opened={tagModalOpened}
          onClose={() => {
            closeTagModal();
            setEditingTag(null);
          }}
          title={editingTag ? 'タグを編集' : 'タグを追加'}
          size="lg"
          keepMounted={false}
        >
          <Box component="form" onSubmit={handleSubmitTag}>
            <Stack gap="md">
              <Select
                label="カテゴリ"
                data={categoryOptions}
                value={tagForm.values.categoryId}
                onChange={(value) => {
                  tagForm.setFieldValue('categoryId', value ?? '');
                  tagForm.setFieldValue('groupId', '');
                }}
                error={tagForm.errors.categoryId}
                required
              />
              <Select
                label="タググループ"
                placeholder={tagForm.values.categoryId ? 'グループを選択してください' : '先にカテゴリを選択してください'}
                data={tagGroupOptions}
                value={tagForm.values.groupId}
                onChange={(value) => tagForm.setFieldValue('groupId', value ?? '')}
                error={tagForm.errors.groupId}
                required
                disabled={!tagForm.values.categoryId || tagGroupOptions.length === 0}
              />
              <TextInput
                label="タグ名"
                value={tagForm.values.name}
                onChange={(event) => tagForm.setFieldValue('name', event.currentTarget.value)}
                error={tagForm.errors.name}
                required
              />
              <TextInput
                label="説明"
                placeholder="タグの補足情報"
                value={tagForm.values.description}
                onChange={(event) => tagForm.setFieldValue('description', event.currentTarget.value)}
              />
              <ColorInput
                label="カラー"
                swatches={PRESET_COLORS}
                value={tagForm.values.color}
                onChange={(value) => tagForm.setFieldValue('color', value || DEFAULT_TAG_COLOR)}
              />
              <Group gap="lg">
                <Switch
                  label="手動付与を許可"
                  checked={tagForm.values.allowsManual}
                  onChange={(event) => tagForm.setFieldValue('allowsManual', event.currentTarget.checked)}
                />
                <Switch
                  label="自動付与を許可"
                  checked={tagForm.values.allowsAutomation}
                  onChange={(event) => tagForm.setFieldValue('allowsAutomation', event.currentTarget.checked)}
                />
              </Group>
              <Switch
                label="アクティブ"
                checked={tagForm.values.isActive}
                onChange={(event) => tagForm.setFieldValue('isActive', event.currentTarget.checked)}
              />
              <Group justify="flex-end" gap="sm">
                <Button variant="outline" onClick={closeTagModal}>
                  キャンセル
                </Button>
                <Button type="submit" loading={isTagSubmitting}>
                  {editingTag ? '更新' : '作成'}
                </Button>
              </Group>
            </Stack>
          </Box>
        </Modal>
      </Stack>
    </Container>
  );
}
