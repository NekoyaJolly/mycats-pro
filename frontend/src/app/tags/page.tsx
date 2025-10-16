'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Collapse,
  ColorInput,
  Container,
  Group,
  Loader,
  Modal,
  MultiSelect,
  Select,
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
  IconChevronDown,
  IconHandGrab,
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
const DEFAULT_CATEGORY_TEXT_COLOR = '#111827';
const DEFAULT_GROUP_COLOR = '#3B82F6';
const DEFAULT_GROUP_TEXT_COLOR = '#111827';
const DEFAULT_TAG_COLOR = '#3B82F6';
const DEFAULT_TAG_TEXT_COLOR = '#FFFFFF';

type CategoryFormValues = {
  key: string;
  name: string;
  description: string;
  color: string;
  textColor: string;
  scopes: string[];
  isActive: boolean;
};

type TagFormValues = {
  categoryId: string;
  name: string;
  groupId: string;
  description: string;
  color: string;
  textColor: string;
  allowsManual: boolean;
  allowsAutomation: boolean;
  isActive: boolean;
};

type GroupFormValues = {
  categoryId: string;
  name: string;
  description: string;
  color: string;
  textColor: string;
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

type SortableGroupCardProps = {
  category: TagCategoryView;
  group: TagGroupView;
  index: number;
  tags: TagView[];
  reorderGroupsPending: boolean;
  deleteGroupPending: boolean;
  isAnyMutationPending: boolean;
  onOpenCreateTag: (categoryId: string, groupId: string) => void;
  onEditGroup: (category: TagCategoryView, group: TagGroupView) => void;
  onDeleteGroup: (groupId: string) => void;
};

function SortableGroupCard({
  category,
  group,
  index,
  tags,
  reorderGroupsPending,
  deleteGroupPending,
  isAnyMutationPending,
  onOpenCreateTag,
  onEditGroup,
  onDeleteGroup,
}: SortableGroupCardProps) {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: group.id,
    data: { type: 'group', categoryId: category.id },
    disabled: reorderGroupsPending,
  });

  const groupColor = group.color ?? DEFAULT_GROUP_COLOR;
  const groupTextColor = group.textColor ?? DEFAULT_GROUP_TEXT_COLOR;

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
    borderColor: groupColor,
    borderWidth: 2,
    backgroundColor: `${groupColor}14`,
  };

  return (
    <Card ref={setNodeRef} style={style} withBorder radius="sm" padding="md" shadow="xs">
      <Group justify="space-between" align="flex-start" gap="sm" wrap="wrap">
        <Stack gap={4} style={{ flex: 1 }}>
          <Group gap="xs" align="center" wrap="wrap">
            <Tooltip label="ドラッグで並べ替え" withArrow withinPortal>
              <ActionIcon
                variant="light"
                aria-label="タググループを並べ替え"
                ref={setActivatorNodeRef}
                disabled={reorderGroupsPending}
                {...listeners}
                {...attributes}
              >
                <IconHandGrab size={14} />
              </ActionIcon>
            </Tooltip>
            <Badge color="gray" variant="light" size="sm">
              {index + 1}
            </Badge>
            <Text fw={600} style={{ color: groupTextColor }}>
              {group.name}
            </Text>
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
        <Group gap={6} align="center" wrap="wrap">
          <Tooltip label="このグループにタグを追加" withArrow withinPortal>
            <ActionIcon
              variant="light"
              size="sm"
              onClick={() => onOpenCreateTag(category.id, group.id)}
              disabled={isAnyMutationPending}
              aria-label="タグを追加"
            >
              <IconPlus size={14} />
            </ActionIcon>
          </Tooltip>
          <ActionIcon
            variant="light"
            aria-label="グループを編集"
            onClick={() => onEditGroup(category, group)}
            disabled={isAnyMutationPending}
          >
            <IconPencil size={14} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="red"
            aria-label="グループを削除"
            onClick={() => void onDeleteGroup(group.id)}
            disabled={deleteGroupPending}
          >
            <IconTrash size={14} />
          </ActionIcon>
        </Group>
      </Group>
    </Card>
  );
}

type SortableTagCardProps = {
  category: TagCategoryView;
  group: TagGroupView;
  tag: TagView;
  index: number;
  reorderTagsPending: boolean;
  deleteTagPending: boolean;
  isAnyMutationPending: boolean;
  onEditTag: (category: TagCategoryView, group: TagGroupView, tag: TagView) => void;
  onDeleteTag: (id: string) => void;
};

function SortableTagCard({
  category,
  group,
  tag,
  index,
  reorderTagsPending,
  deleteTagPending,
  isAnyMutationPending,
  onEditTag,
  onDeleteTag,
}: SortableTagCardProps) {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: tag.id,
    data: { type: 'tag', groupId: group.id },
    disabled: reorderTagsPending,
  });

  const tagColor = tag.color ?? DEFAULT_TAG_COLOR;
  const tagTextColor = tag.textColor ?? DEFAULT_TAG_TEXT_COLOR;

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.95 : 1,
    borderColor: tagColor,
    borderWidth: 2,
    backgroundColor: `${tagColor}14`,
  };

  return (
    <Card ref={setNodeRef} style={style} withBorder radius="sm" padding="sm">
      <Group justify="space-between" align="center" gap="sm" wrap="wrap">
        <Stack gap={4} style={{ flex: 1 }}>
          <Group gap="xs" align="center" wrap="wrap">
            <Tooltip label="ドラッグで並べ替え" withArrow withinPortal>
              <ActionIcon
                variant="light"
                aria-label="タグを並べ替え"
                ref={setActivatorNodeRef}
                disabled={reorderTagsPending}
                {...attributes}
                {...listeners}
              >
                <IconHandGrab size={14} />
              </ActionIcon>
            </Tooltip>
            <Badge color="gray" variant="light" size="sm">
              {index + 1}
            </Badge>
            <Text fw={600} size="sm" style={{ color: tagTextColor }}>
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
          <Group gap="xs" wrap="wrap">
            <Badge size="xs" variant="outline">
              手動 {tag.allowsManual ? '可' : '不可'}
            </Badge>
            <Badge size="xs" variant="outline">
              自動 {tag.allowsAutomation ? '可' : '不可'}
            </Badge>
            <Badge size="xs" variant="outline">
              {group.name}
            </Badge>
            <Badge
              size="xs"
              variant="light"
              style={{
                backgroundColor: `${(category.color ?? DEFAULT_CATEGORY_COLOR)}1A`,
                color: category.color ?? DEFAULT_CATEGORY_COLOR,
              }}
            >
              {category.name}
            </Badge>
          </Group>
        </Stack>
        <Group gap={4} align="center" wrap="wrap">
          <ActionIcon
            variant="light"
            aria-label="タグを編集"
            onClick={() => onEditTag(category, group, tag)}
            disabled={isAnyMutationPending}
          >
            <IconPencil size={14} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="red"
            aria-label="タグを削除"
            onClick={() => void onDeleteTag(tag.id)}
            disabled={deleteTagPending}
          >
            <IconTrash size={14} />
          </ActionIcon>
        </Group>
      </Group>
    </Card>
  );
}

type SortableCategoryCardProps = {
  category: TagCategoryView;
  isAnyMutationPending: boolean;
  reorderCategoriesPending: boolean;
  deleteCategoryPending: boolean;
  deleteGroupPending: boolean;
  deleteTagPending: boolean;
  reorderGroupsPending: boolean;
  reorderTagsPending: boolean;
  onEditCategory: (category: TagCategoryView) => void;
  onDeleteCategory: (id: string) => void;
  onOpenCreateGroup: (categoryId: string) => void;
  onOpenCreateTag: (categoryId: string, groupId?: string) => void;
  onEditGroup: (category: TagCategoryView, group: TagGroupView) => void;
  onDeleteGroup: (groupId: string) => void;
  onEditTag: (category: TagCategoryView, group: TagGroupView, tag: TagView) => void;
  onDeleteTag: (id: string) => void;
  onReorderGroups: (categoryId: string, groups: TagGroupView[]) => void;
  onReorderTags: (groupId: string, tags: TagView[]) => void;
};

function SortableCategoryCard({
  category,
  isAnyMutationPending,
  reorderCategoriesPending,
  deleteCategoryPending,
  deleteGroupPending,
  deleteTagPending,
  reorderGroupsPending,
  reorderTagsPending,
  onEditCategory,
  onDeleteCategory,
  onOpenCreateGroup,
  onOpenCreateTag,
  onEditGroup,
  onDeleteGroup,
  onEditTag,
  onDeleteTag,
  onReorderGroups,
  onReorderTags,
}: SortableCategoryCardProps) {
  const sortedGroups = useMemo(() => sortGroups(category.groups), [category.groups]);
  const [groupsOpened, { toggle: toggleGroups }] = useDisclosure(false);
  const [tagsOpened, { toggle: toggleTags }] = useDisclosure(false);
  const [groupOrder, setGroupOrder] = useState(sortedGroups);
  const [tagOrders, setTagOrders] = useState<Record<string, TagView[]>>(() =>
    Object.fromEntries(sortedGroups.map((group) => [group.id, sortTags(group.tags)])),
  );

  useEffect(() => {
    setGroupOrder(sortedGroups);
    setTagOrders(Object.fromEntries(sortedGroups.map((group) => [group.id, sortTags(group.tags)])));
  }, [sortedGroups]);

  const totalTags = useMemo(
    () =>
      groupOrder.reduce((sum, group) => {
        const tags = tagOrders[group.id] ?? sortTags(group.tags);
        return sum + tags.length;
      }, 0),
    [groupOrder, tagOrders],
  );

  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: category.id,
    data: { type: 'category' },
    disabled: reorderCategoriesPending,
  });

  const colorHex = category.color ?? DEFAULT_CATEGORY_COLOR;

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
    borderColor: colorHex,
    borderWidth: 2,
    backgroundColor: `${colorHex}14`,
  };

  const nestedSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleGroupDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id || reorderGroupsPending) {
      return;
    }

    const oldIndex = groupOrder.findIndex((group) => group.id === active.id);
    const newIndex = groupOrder.findIndex((group) => group.id === over.id);
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reordered = arrayMove(groupOrder, oldIndex, newIndex);
    setGroupOrder(reordered);
    void onReorderGroups(category.id, reordered);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      withBorder
      padding="lg"
      radius="md"
      shadow="sm"
    >
      <Stack gap="sm">
        <Group justify="space-between" align="center" gap="sm" wrap="wrap">
          <Group gap="sm" align="center" wrap="wrap">
            <Tooltip label="ドラッグで並べ替え" withArrow withinPortal>
              <ActionIcon
                variant="light"
                aria-label="カテゴリを並べ替え"
                ref={setActivatorNodeRef}
                disabled={reorderCategoriesPending}
                {...listeners}
                {...attributes}
              >
                <IconHandGrab size={16} />
              </ActionIcon>
            </Tooltip>
            <Text fw={600} size="lg" style={{ color: category.textColor ?? DEFAULT_CATEGORY_TEXT_COLOR }}>
              {category.name}
            </Text>
            {!category.isActive && (
              <Badge color="gray" variant="outline" size="sm">
                非アクティブ
              </Badge>
            )}
            <Group gap={6} wrap="wrap">
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
          </Group>
          <Group gap={6} align="center">
            <ActionIcon
              variant="light"
              aria-label="カテゴリを編集"
              onClick={() => onEditCategory(category)}
              disabled={isAnyMutationPending}
            >
              <IconPencil size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="red"
              aria-label="カテゴリを削除"
              onClick={() => void onDeleteCategory(category.id)}
              disabled={deleteCategoryPending}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Group>

        <Group justify="space-between" align="center" gap="sm" wrap="wrap">
          <Group gap="md" align="center" wrap="wrap" style={{ flex: 1 }}>
            <Text size="sm" c="dimmed" style={{ flex: 1 }}>
              {category.description || '説明が設定されていません'}
            </Text>
          </Group>
          <Group gap="md" align="center" wrap="wrap">
            <Group gap={4} align="center">
              <Button
                variant="subtle"
                size="xs"
                rightSection={
                  <IconChevronDown
                    size={12}
                    style={{ transform: groupsOpened ? 'rotate(180deg)' : undefined, transition: 'transform 120ms ease' }}
                  />
                }
                onClick={toggleGroups}
              >
                グループ {groupOrder.length}
              </Button>
              <Tooltip label="グループを追加" withArrow withinPortal>
                <ActionIcon
                  variant="light"
                  size="sm"
                  onClick={() => onOpenCreateGroup(category.id)}
                  disabled={isAnyMutationPending}
                  aria-label="グループを追加"
                >
                  <IconPlus size={14} />
                </ActionIcon>
              </Tooltip>
            </Group>
            <Group gap={4} align="center">
              <Button
                variant="subtle"
                size="xs"
                rightSection={
                  <IconChevronDown
                    size={12}
                    style={{ transform: tagsOpened ? 'rotate(180deg)' : undefined, transition: 'transform 120ms ease' }}
                  />
                }
                onClick={toggleTags}
              >
                タグ {totalTags}
              </Button>
              <Tooltip label="タグを追加" withArrow withinPortal>
                <ActionIcon
                  variant="light"
                  size="sm"
                  onClick={() => onOpenCreateTag(category.id)}
                  disabled={isAnyMutationPending}
                  aria-label="タグを追加"
                >
                  <IconPlus size={14} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
        </Group>

        <Collapse in={groupsOpened}>
          <Stack gap="sm" mt="sm">
            {groupOrder.length === 0 ? (
              <Text size="sm" c="dimmed">
                このカテゴリにはまだタググループがありません。
              </Text>
            ) : (
              <DndContext
                sensors={nestedSensors}
                collisionDetection={closestCenter}
                onDragEnd={handleGroupDragEnd}
              >
                <SortableContext items={groupOrder.map((group) => group.id)} strategy={rectSortingStrategy}>
                  <Stack gap="sm">
                    {groupOrder.map((group, groupIndex) => {
                      const tags = tagOrders[group.id] ?? sortTags(group.tags);
                      return (
                        <SortableGroupCard
                          key={group.id}
                          category={category}
                          group={group}
                          index={groupIndex}
                          tags={tags}
                          reorderGroupsPending={reorderGroupsPending}
                          deleteGroupPending={deleteGroupPending}
                          isAnyMutationPending={isAnyMutationPending}
                          onOpenCreateTag={onOpenCreateTag}
                          onEditGroup={onEditGroup}
                          onDeleteGroup={onDeleteGroup}
                        />
                      );
                    })}
                  </Stack>
                </SortableContext>
              </DndContext>
            )}
          </Stack>
        </Collapse>

        <Collapse in={tagsOpened}>
          <Stack gap="md" mt="sm">
            {totalTags === 0 ? (
              <Text size="sm" c="dimmed">
                このカテゴリにはまだタグがありません。
              </Text>
            ) : (
              groupOrder.map((group) => {
                const tags = tagOrders[group.id] ?? sortTags(group.tags);
                return (
                  <Stack key={group.id} gap="xs">
                    <Group justify="space-between" align="center" wrap="wrap">
                      <Group gap="xs" align="center" wrap="wrap">
                        <Badge variant="light" color="gray">
                          {group.name}
                        </Badge>
                        <Badge size="xs" variant="outline">
                          タグ {tags.length}
                        </Badge>
                      </Group>
                      <Tooltip label="このグループにタグを追加" withArrow withinPortal>
                        <ActionIcon
                          variant="light"
                          size="sm"
                          onClick={() => onOpenCreateTag(category.id, group.id)}
                          disabled={isAnyMutationPending}
                          aria-label="タグを追加"
                        >
                          <IconPlus size={14} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                    {tags.length === 0 ? (
                      <Text size="xs" c="dimmed" pl="md">
                        このグループにはまだタグがありません。
                      </Text>
                    ) : (
                      <DndContext
                        sensors={nestedSensors}
                        collisionDetection={closestCenter}
                        onDragEnd={({ active, over }) => {
                          if (!over || active.id === over.id || reorderTagsPending) {
                            return;
                          }
                          const currentTags = tagOrders[group.id] ?? tags;
                          const oldIndex = currentTags.findIndex((item) => item.id === active.id);
                          const newIndex = currentTags.findIndex((item) => item.id === over.id);
                          if (oldIndex === -1 || newIndex === -1) {
                            return;
                          }
                          const reordered = arrayMove(currentTags, oldIndex, newIndex);
                          setTagOrders((prev) => ({ ...prev, [group.id]: reordered }));
                          void onReorderTags(group.id, reordered);
                        }}
                      >
                        <SortableContext
                          items={(tagOrders[group.id] ?? tags).map((tag) => tag.id)}
                          strategy={rectSortingStrategy}
                        >
                          <Stack gap="xs">
                            {(tagOrders[group.id] ?? tags).map((tag, tagIndex) => (
                              <SortableTagCard
                                key={tag.id}
                                category={category}
                                group={group}
                                tag={tag}
                                index={tagIndex}
                                reorderTagsPending={reorderTagsPending}
                                deleteTagPending={deleteTagPending}
                                isAnyMutationPending={isAnyMutationPending}
                                onEditTag={onEditTag}
                                onDeleteTag={onDeleteTag}
                              />
                            ))}
                          </Stack>
                        </SortableContext>
                      </DndContext>
                    )}
                  </Stack>
                );
              })
            )}
          </Stack>
        </Collapse>
      </Stack>
    </Card>
  );
}

function buildCategoryPayload(values: CategoryFormValues): CreateTagCategoryRequest & {
  textColor?: string;
} {
  const payload: CreateTagCategoryRequest & { textColor?: string } = {
    name: values.name,
    ...(values.key ? { key: values.key } : {}),
    ...(values.description ? { description: values.description } : {}),
    color: values.color || DEFAULT_CATEGORY_COLOR,
    textColor: values.textColor || DEFAULT_CATEGORY_TEXT_COLOR,
    ...(values.scopes.length ? { scopes: values.scopes } : { scopes: [] }),
    isActive: values.isActive,
  };
  return payload;
}

function buildTagPayload(values: TagFormValues): CreateTagRequest & {
  textColor?: string;
} {
  const payload: CreateTagRequest & { textColor?: string } = {
    name: values.name,
    groupId: values.groupId,
    ...(values.description ? { description: values.description } : {}),
    color: values.color || DEFAULT_TAG_COLOR,
    textColor: values.textColor || DEFAULT_TAG_TEXT_COLOR,
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
      textColor: DEFAULT_CATEGORY_TEXT_COLOR,
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
      textColor: DEFAULT_TAG_TEXT_COLOR,
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
      color: DEFAULT_GROUP_COLOR,
      textColor: DEFAULT_GROUP_TEXT_COLOR,
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
      if (tagForm.values.groupId !== '') {
        tagForm.setFieldValue('groupId', '');
      }
      return;
    }

    if (tagForm.values.groupId && !tagGroupOptions.some((option) => option.value === tagForm.values.groupId)) {
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
      textColor: DEFAULT_CATEGORY_TEXT_COLOR,
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
      textColor: category.textColor ?? DEFAULT_CATEGORY_TEXT_COLOR,
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
      color: DEFAULT_GROUP_COLOR,
      textColor: DEFAULT_GROUP_TEXT_COLOR,
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
      color: group.color ?? DEFAULT_GROUP_COLOR,
      textColor: group.textColor ?? DEFAULT_GROUP_TEXT_COLOR,
      isActive: group.isActive,
    });
    openGroupModal();
  };

  const handleSubmitGroup = groupForm.onSubmit(async (values) => {
    const payload: CreateTagGroupRequest & { color?: string; textColor?: string } = {
      categoryId: values.categoryId,
      name: values.name,
      ...(values.description ? { description: values.description } : {}),
      color: values.color || DEFAULT_GROUP_COLOR,
      textColor: values.textColor || DEFAULT_GROUP_TEXT_COLOR,
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

  const handleReorderGroups = async (categoryId: string, groups: TagGroupView[]) => {
    if (reorderGroupsMutation.isPending) {
      return;
    }

    try {
      await reorderGroupsMutation.mutateAsync({
        items: groups.map((group, orderIndex) => ({
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
      textColor: DEFAULT_TAG_TEXT_COLOR,
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
      textColor: tag.textColor ?? DEFAULT_TAG_TEXT_COLOR,
      allowsManual: tag.allowsManual,
      allowsAutomation: tag.allowsAutomation,
      isActive: tag.isActive,
    });
    openTagModal();
  };

  const handleReorderTags = async (groupId: string, tags: TagView[]) => {
    if (reorderTagsMutation.isPending) {
      return;
    }

    try {
      await reorderTagsMutation.mutateAsync({
        items: tags.map((tag, orderIndex) => ({
          id: tag.id,
          displayOrder: orderIndex,
          groupId,
        })),
      });
    } catch {
      // noop
    }
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleCategoryDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id || reorderCategoriesMutation.isPending) {
      return;
    }

    const oldIndex = sortedCategories.findIndex((item) => item.id === active.id);
    const newIndex = sortedCategories.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reordered = arrayMove(sortedCategories, oldIndex, newIndex);
    void reorderCategoriesMutation.mutateAsync({
      items: reordered.map((category, orderIndex) => ({
        id: category.id,
        displayOrder: orderIndex,
      })),
    });
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
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
                <SortableContext items={sortedCategories.map((category) => category.id)} strategy={rectSortingStrategy}>
                  <Stack gap="lg">
                    {sortedCategories.map((category) => (
                      <SortableCategoryCard
                        key={category.id}
                        category={category}
                        isAnyMutationPending={isAnyMutationPending}
                        reorderCategoriesPending={reorderCategoriesMutation.isPending}
                        deleteCategoryPending={deleteCategory.isPending}
                        deleteGroupPending={deleteGroup.isPending}
                        deleteTagPending={deleteTag.isPending}
                        reorderGroupsPending={reorderGroupsMutation.isPending}
                        reorderTagsPending={reorderTagsMutation.isPending}
                        onEditCategory={handleEditCategory}
                        onDeleteCategory={handleDeleteCategory}
                        onOpenCreateGroup={handleOpenCreateGroup}
                        onOpenCreateTag={handleOpenCreateTag}
                        onEditGroup={handleEditGroup}
                        onDeleteGroup={handleDeleteGroupAction}
                        onEditTag={handleEditTag}
                        onDeleteTag={handleDeleteTag}
                        onReorderGroups={handleReorderGroups}
                        onReorderTags={handleReorderTags}
                      />
                    ))}
                  </Stack>
                </SortableContext>
              </DndContext>
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
              <Group gap="md" align="flex-end">
                <ColorInput
                  label="背景カラー"
                  swatches={PRESET_COLORS}
                  value={categoryForm.values.color}
                  onChange={(value) => categoryForm.setFieldValue('color', value || DEFAULT_CATEGORY_COLOR)}
                  style={{ flex: 1 }}
                />
                <ColorInput
                  label="テキストカラー"
                  swatches={PRESET_COLORS}
                  value={categoryForm.values.textColor}
                  onChange={(value) =>
                    categoryForm.setFieldValue('textColor', value || DEFAULT_CATEGORY_TEXT_COLOR)
                  }
                  style={{ flex: 1 }}
                />
              </Group>
              <Card
                withBorder
                padding="sm"
                radius="md"
                shadow="xs"
                style={{
                  backgroundColor: `${(categoryForm.values.color || DEFAULT_CATEGORY_COLOR)}26`,
                  color: categoryForm.values.textColor || DEFAULT_CATEGORY_TEXT_COLOR,
                  borderColor: categoryForm.values.color || DEFAULT_CATEGORY_COLOR,
                }}
              >
                <Text fw={600}>{categoryForm.values.name || 'カテゴリ名'}</Text>
                <Text size="xs">サンプルプレビュー</Text>
              </Card>
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
              <Group gap="md" align="flex-end">
                <ColorInput
                  label="背景カラー"
                  swatches={PRESET_COLORS}
                  value={groupForm.values.color}
                  onChange={(value) => groupForm.setFieldValue('color', value || DEFAULT_GROUP_COLOR)}
                  style={{ flex: 1 }}
                />
                <ColorInput
                  label="テキストカラー"
                  swatches={PRESET_COLORS}
                  value={groupForm.values.textColor}
                  onChange={(value) =>
                    groupForm.setFieldValue('textColor', value || DEFAULT_GROUP_TEXT_COLOR)
                  }
                  style={{ flex: 1 }}
                />
              </Group>
              <Card
                withBorder
                padding="sm"
                radius="md"
                shadow="xs"
                style={{
                  backgroundColor: `${(groupForm.values.color || DEFAULT_GROUP_COLOR)}26`,
                  color: groupForm.values.textColor || DEFAULT_GROUP_TEXT_COLOR,
                  borderColor: groupForm.values.color || DEFAULT_GROUP_COLOR,
                }}
              >
                <Text fw={600}>{groupForm.values.name || 'タググループ名'}</Text>
                <Text size="xs">サンプルプレビュー</Text>
              </Card>
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
              <Group gap="md" align="flex-end">
                <ColorInput
                  label="背景カラー"
                  swatches={PRESET_COLORS}
                  value={tagForm.values.color}
                  onChange={(value) => tagForm.setFieldValue('color', value || DEFAULT_TAG_COLOR)}
                  style={{ flex: 1 }}
                />
                <ColorInput
                  label="テキストカラー"
                  swatches={PRESET_COLORS}
                  value={tagForm.values.textColor}
                  onChange={(value) =>
                    tagForm.setFieldValue('textColor', value || DEFAULT_TAG_TEXT_COLOR)
                  }
                  style={{ flex: 1 }}
                />
              </Group>
              <Card
                withBorder
                padding="sm"
                radius="md"
                shadow="xs"
                style={{
                  backgroundColor: `${(tagForm.values.color || DEFAULT_TAG_COLOR)}26`,
                  color: tagForm.values.textColor || DEFAULT_TAG_TEXT_COLOR,
                  borderColor: tagForm.values.color || DEFAULT_TAG_COLOR,
                }}
              >
                <Group gap="xs" align="center" wrap="wrap">
                  <Text fw={600}>{tagForm.values.name || 'タグ名'}</Text>
                  <Badge size="xs" variant="outline" color="gray">
                    プレビュー
                  </Badge>
                </Group>
                {tagForm.values.description && (
                  <Text size="xs" mt={4}>
                    {tagForm.values.description}
                  </Text>
                )}
                <Group gap={6} mt="xs" wrap="wrap">
                  <Badge
                    size="xs"
                    variant="light"
                    style={{
                      backgroundColor: `${(tagForm.values.color || DEFAULT_TAG_COLOR)}33`,
                      color: tagForm.values.textColor || DEFAULT_TAG_TEXT_COLOR,
                    }}
                  >
                    手動 {tagForm.values.allowsManual ? '可' : '不可'}
                  </Badge>
                  <Badge
                    size="xs"
                    variant="light"
                    style={{
                      backgroundColor: `${(tagForm.values.color || DEFAULT_TAG_COLOR)}33`,
                      color: tagForm.values.textColor || DEFAULT_TAG_TEXT_COLOR,
                    }}
                  >
                    自動 {tagForm.values.allowsAutomation ? '可' : '不可'}
                  </Badge>
                </Group>
              </Card>
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
