'use client';

import { useEffect, useMemo, type CSSProperties } from 'react';
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
  Tooltip,
  Loader,
  Center,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconWand } from '@tabler/icons-react';

import {
  useGetTagCategories,
  type TagCategoryFilters,
  type TagCategoryView,
  type TagView,
} from '@/lib/api/hooks/use-tags';

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tagIds: string[]) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  filters?: TagCategoryFilters;
  categories?: TagCategoryView[];
  autoAssignments?: Record<string, AutomationMeta>;
  showAutomationBadges?: boolean;
}

interface AutomationMeta {
  ruleName?: string;
  source?: string;
  assignedAt?: string;
  reason?: string;
}

function getBadgeColors(tag: TagView): CSSProperties {
  if (tag.color) {
    return {
      backgroundColor: `${tag.color}20`,
    };
  }

  return {
    color: 'var(--mantine-color-white)',
    backgroundColor: 'var(--mantine-primary-color-filled)',
  };
}

function useResolvedCategories(categories?: TagCategoryView[], filters?: TagCategoryFilters) {
  const shouldFetch = !categories;
  const { data, isLoading } = useGetTagCategories(filters, {
    enabled: shouldFetch,
  });

  const resolved = useMemo(() => {
    if (categories) {
      return categories;
    }
    return data?.data ?? [];
  }, [categories, data]);

  return {
    categories: resolved,
    isLoading: shouldFetch ? isLoading : false,
  };
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

  const automationObj = automation as Record<string, unknown>;

  const result: AutomationMeta = {
    ruleName: typeof automationObj.ruleName === 'string' ? automationObj.ruleName : undefined,
    source: typeof automationObj.source === 'string' ? automationObj.source : undefined,
    assignedAt: typeof automationObj.assignedAt === 'string' ? automationObj.assignedAt : undefined,
    reason: typeof automationObj.reason === 'string' ? automationObj.reason : undefined,
  };

  return Object.values(result).some(Boolean) ? result : null;
}

function renderAutomationBadge(meta: AutomationMeta | null | undefined) {
  if (!meta) {
    return null;
  }

  const tooltip = [meta.ruleName, meta.reason, meta.source, meta.assignedAt]
    .filter(Boolean)
    .join(' / ');

  const badge = (
    <Group gap={4} align="center" wrap="nowrap" style={{ fontSize: 11 }}>
      <IconWand size={12} />
      <Text span>自動</Text>
    </Group>
  );

  return tooltip ? (
    <Tooltip label={tooltip} withArrow multiline withinPortal>
      {badge}
    </Tooltip>
  ) : (
    badge
  );
}

export default function TagSelector({
  selectedTags,
  onChange,
  placeholder = 'タグを選択',
  label = 'タグ',
  disabled = false,
  filters,
  categories: categoriesProp,
  autoAssignments,
  showAutomationBadges = true,
}: TagSelectorProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const { categories, isLoading } = useResolvedCategories(categoriesProp, filters);

  useEffect(() => {
    if (disabled && opened) {
      close();
    }
  }, [disabled, opened, close]);

  const allTags = useMemo(() => categories.flatMap((category) => category.tags || []), [categories]);
  const tagMap = useMemo(() => new Map(allTags.map((tag) => [tag.id, tag])), [allTags]);

  const tagOptions = useMemo(
    () =>
      allTags.map((tag) => ({
        value: tag.id,
        label: tag.name,
        color: tag.color,
        automation: autoAssignments?.[tag.id] ?? extractAutomationMeta(tag),
      })),
    [allTags, autoAssignments],
  );

  const selectedTagDetails = useMemo(
    () => selectedTags.map((tagId) => tagMap.get(tagId)).filter(Boolean) as TagView[],
    [selectedTags, tagMap],
  );

  const automationMap = useMemo(() => {
    if (!showAutomationBadges) {
      return new Map<string, AutomationMeta>();
    }

    const map = new Map<string, AutomationMeta>();

    selectedTagDetails.forEach((tag) => {
      const meta = autoAssignments?.[tag.id] ?? extractAutomationMeta(tag);
      if (meta) {
        map.set(tag.id, meta);
      }
    });

    return map;
  }, [autoAssignments, selectedTagDetails, showAutomationBadges]);

  const handleToggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onChange(selectedTags.filter((id) => id !== tagId));
      return;
    }

    onChange([...selectedTags, tagId]);
  };

  const isDisabled = disabled || (isLoading && !categoriesProp);

  return (
    <Box>
      <Group justify="space-between" mb="xs">
        <Text size="sm" fw={500}>
          {label}
        </Text>
        <Button
          size="xs"
          variant="light"
          leftSection={<IconPlus size={12} />}
          onClick={open}
          disabled={isDisabled}
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
        disabled={isDisabled}
        nothingFoundMessage={isLoading ? '読み込み中...' : '利用可能なタグがありません'}
        renderOption={({ option }) => {
          const tag = tagMap.get(option.value);
          const automationMeta = showAutomationBadges
            ? (option as typeof option & { automation?: AutomationMeta }).automation
            : undefined;

          return (
            <Group gap="xs">
              <Box w={8} h={8} bg={tag?.color || 'var(--mantine-primary-color-filled)'} style={{ borderRadius: '50%' }} />
              <Text>{option.label}</Text>
              {automationMeta && renderAutomationBadge(automationMeta)}
            </Group>
          );
        }}
      />

      {isLoading && (
        <Center mt="xs">
          <Loader size="sm" />
        </Center>
      )}

      {selectedTagDetails.length > 0 && (
        <Group gap="xs" mt="xs">
          {selectedTagDetails.map((tag) => (
            <Badge key={tag.id} size="sm" variant="light" radius="md" style={getBadgeColors(tag)}>
              {tag.name}
              {showAutomationBadges && automationMap.get(tag.id) && (
                <Box component="span" ml={6}>
                  {renderAutomationBadge(automationMap.get(tag.id))}
                </Box>
              )}
            </Badge>
          ))}
        </Group>
      )}

      <Modal opened={opened} onClose={close} title="タグ選択" size="lg" keepMounted={false}>
        {isLoading && (
          <Center py="xl">
            <Loader />
          </Center>
        )}

        {!isLoading && categories.length === 0 && (
          <Center py="xl">
            <Text c="dimmed">利用可能なカテゴリがありません。</Text>
          </Center>
        )}

        {!isLoading && categories.length > 0 && (
          <Stack gap="md">
            {categories.map((category) => (
              <Card key={category.id} padding="md" withBorder>
                <Stack gap="sm">
                  <Group gap="xs">
                    <Box w={12} h={12} bg={category.color || 'var(--mantine-primary-color-filled)'} style={{ borderRadius: 2 }} />
                    <Text fw={500} c={category.color}>
                      {category.name}
                    </Text>
                  </Group>

                  {category.description && (
                    <Text size="xs" c="dimmed">
                      {category.description}
                    </Text>
                  )}

                  <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="xs">
                    {(category.tags ?? []).map((tag) => {
                      const isSelected = selectedTags.includes(tag.id);
                      const automationMeta = showAutomationBadges
                        ? autoAssignments?.[tag.id] ?? extractAutomationMeta(tag)
                        : undefined;

                      return (
                        <Tooltip
                          key={tag.id}
                          label={
                            tag.description
                              ? tag.description
                              : `使用回数: ${tag.usageCount.toLocaleString()}回`
                          }
                          withArrow
                          withinPortal
                        >
                          <Badge
                            size="md"
                            radius="md"
                            variant="light"
                            style={{
                              cursor: 'pointer',
                              backgroundColor: isSelected
                                ? tag.color ?? 'var(--mantine-primary-color-filled)'
                                : tag.color
                                  ? `${tag.color}15`
                                  : 'var(--mantine-color-gray-1)',
                              color: isSelected
                                ? tag.color
                                  ? 'var(--mantine-color-white)'
                                  : 'var(--mantine-color-dark-6)'
                                : tag.color ?? 'var(--mantine-color-dark-6)',
                              border: isSelected && tag.color
                                ? `1px solid ${tag.color}`
                                : undefined,
                            }}
                            onClick={() => handleToggleTag(tag.id)}
                          >
                            {tag.name}
                            {showAutomationBadges && automationMeta && (
                              <Box component="span" ml={6}>
                                {renderAutomationBadge(automationMeta)}
                              </Box>
                            )}
                          </Badge>
                        </Tooltip>
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
        )}
      </Modal>
    </Box>
  );
}

interface TagDisplayProps {
  tagIds: string[];
  categories?: TagCategoryView[];
  filters?: TagCategoryFilters;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function TagDisplay({ tagIds, categories: categoriesProp, filters, size = 'sm' }: TagDisplayProps) {
  const { categories, isLoading } = useResolvedCategories(categoriesProp, filters);

  const tagMap = useMemo(() => {
    const map = new Map<string, TagView>();
    categories.forEach((category) => {
      (category.tags ?? []).forEach((tag) => {
        map.set(tag.id, tag);
      });
    });
    return map;
  }, [categories]);

  const tags = useMemo(() => tagIds.map((tagId) => tagMap.get(tagId)).filter(Boolean) as TagView[], [tagIds, tagMap]);

  if (isLoading) {
    return (
      <Center>
        <Loader size="sm" />
      </Center>
    );
  }

  if (tags.length === 0) {
    return null;
  }

  return (
    <Group gap="xs">
      {tags.map((tag) => (
        <Badge key={tag.id} size={size} variant="light" radius="md" style={getBadgeColors(tag)}>
          <Group gap={6} wrap="nowrap" align="center">
            <Text span>{tag.name}</Text>
            {renderAutomationBadge(extractAutomationMeta(tag))}
          </Group>
        </Badge>
      ))}
    </Group>
  );
}
