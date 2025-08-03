"use client";

import { useRouter } from "next/navigation";
import { Container, Title, Paper, Group, Button, Stack, TextInput, Textarea, Select } from "@mantine/core";
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react";
import { useState } from "react";

// 仮のダミーデータ
const dummyCat = {
  id: "1",
  name: "レオ",
  gender: "オス",
  color: "茶トラ",
  birthDate: "2023-03-15",
  description: "とても元気なオス猫。人懐っこく、遊ぶのが大好き。",
};

export default function CatEditPage() {
  const router = useRouter();
  const [form, setForm] = useState({ ...dummyCat });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Cat updated:", form);
    router.push(`/cats/${form.id}`);
  };

  const handleDelete = () => {
    if (confirm("本当に削除しますか？")) {
      console.log("Cat deleted:", form.id);
      router.push("/cats");
    }
  };

  return (
    <Container size="md" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={1}>猫の情報編集</Title>
        <Button
          variant="outline"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => router.push(`/cats/${form.id}`)}
        >
          詳細へ戻る
        </Button>
      </Group>

      <Paper shadow="sm" p="xl" radius="md">
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="名前"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />

            <Select
              label="性別"
              value={form.gender}
              onChange={(value) => handleChange("gender", value || "")}
              data={[
                { value: "オス", label: "オス" },
                { value: "メス", label: "メス" },
              ]}
            />

            <TextInput
              label="色柄"
              value={form.color}
              onChange={(e) => handleChange("color", e.target.value)}
            />

            <TextInput
              label="生年月日"
              type="date"
              value={form.birthDate}
              onChange={(e) => handleChange("birthDate", e.target.value)}
            />

            <Textarea
              label="詳細説明"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={4}
            />

            <Group justify="flex-end" gap="md" pt="md">
              <Button variant="outline" color="red" onClick={handleDelete}>
                削除
              </Button>
              <Button type="submit" leftSection={<IconDeviceFloppy size={16} />}>
                保存
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}