'use client';

import { AppShell, Burger, Group, Text, ScrollArea, NavLink } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  IconPaw,
  IconList,
  IconHeart,
  IconBabyCarriage,
  IconTag,
  IconCertificate,
} from '@tabler/icons-react';

const navigationItems = [
  {
    label: '新規猫登録',
    href: '/cats/new',
    icon: IconPaw,
  },
  {
    label: '在舎猫一覧',
    href: '/cats',
    icon: IconList,
  },
  {
    label: '交配管理',
    href: '/breeding',
    icon: IconHeart,
  },
  {
    label: '子猫管理',
    href: '/kittens',
    icon: IconBabyCarriage,
  },
  {
    label: 'タグ管理',
    href: '/tags',
    icon: IconTag,
  },
  {
    label: '血統書データ',
    href: '/pedigrees',
    icon: IconCertificate,
  },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const pathname = usePathname();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="0"
      styles={() => ({
        header: {
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--border-subtle)',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
        },
        navbar: {
          backgroundColor: 'var(--surface)',
          borderRight: '1px solid var(--border-subtle)',
        },
        main: {
          backgroundColor: 'var(--background-base)',
        },
      })}
    >
      <AppShell.Header>
        <Group
          h="100%"
          px="md"
          justify="space-between"
          style={{ color: 'var(--text-primary)' }}
        >
          <Group>
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="sm"
            />
            <Burger
              opened={desktopOpened}
              onClick={toggleDesktop}
              visibleFrom="sm"
              size="sm"
            />
            <Text size="lg" fw={700} style={{ color: 'var(--text-primary)' }}>
              🐱 猫生体管理アプリ
            </Text>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section grow component={ScrollArea}>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <NavLink
                key={item.href}
                component={Link}
                href={item.href}
                label={item.label}
                leftSection={<Icon size={20} stroke={1.5} />}
                active={isActive}
                onClick={() => {
                  // モバイルでリンクをクリックしたらナビゲーションを閉じる
                  if (mobileOpened) {
                    toggleMobile();
                  }
                }}
                styles={() => ({
                  root: {
                    borderRadius: 10,
                    marginBottom: 6,
                    border: isActive ? '1px solid var(--accent)' : '1px solid transparent',
                    backgroundColor: isActive ? 'var(--accent-subtle)' : 'transparent',
                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                    transition: 'background-color 120ms ease, border-color 120ms ease',
                  },
                  label: {
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  },
                  leftSection: {
                    color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  },
                })}
              />
            );
          })}
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main style={{ paddingBottom: 72 }}>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
