'use client';

import {
  AppShell,
  Avatar,
  Badge,
  Burger,
  Group,
  Menu,
  ScrollArea,
  Text,
  NavLink,
  Center,
  Loader,
  Box,
  Stack,
  UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  IconPaw,
  IconList,
  IconHeart,
  IconBabyCarriage,
  IconTag,
  IconCertificate,
  IconChevronDown,
  IconLogout,
  IconUser,
} from '@tabler/icons-react';
import { useAuth } from '@/lib/auth/store';
import { isAuthRoute, isProtectedRoute } from '@/lib/auth/routes';
import { notifications } from '@mantine/notifications';

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

const bottomNavigationItems = [
  { label: 'ホーム', href: '/', icon: '🏠' },
  { label: '交配', href: '/breeding', icon: '🔗' },
  { label: '子猫', href: '/kittens', icon: '🐾' },
  { label: 'ケア', href: '/care', icon: '🩺' },
  { label: 'その他', href: '/more', icon: '⚙️' },
];

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname() ?? '/';
  const searchParams = useSearchParams();
  const router = useRouter();
  // 両方とも初期状態は閉じた状態に変更（遷移で自動的に閉じる仕様）
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);
  const [desktopOpened, { toggle: toggleDesktop, close: closeDesktop }] = useDisclosure(false);
  const { user, isAuthenticated, initialized, isLoading, logout } = useAuth();
  const [logoutLoading, setLogoutLoading] = useState(false);

  const isAuthPage = isAuthRoute(pathname);
  const requiresAuth = isProtectedRoute(pathname);
  const search = searchParams?.toString() ?? '';
  const targetPath = search ? `${pathname}?${search}` : pathname;

  const accountLabel = useMemo(() => {
    if (!user) {
      return 'ゲスト';
    }
    const name = [user.lastName, user.firstName].filter(Boolean).join(' ');
    return name || user.email || 'ユーザー';
  }, [user]);

  const accountInitials = useMemo(() => {
    if (!user) {
      return 'MC';
    }
    const nameSeed = `${user.lastName ?? ''}${user.firstName ?? ''}`.trim();
    if (nameSeed) {
      return nameSeed.slice(0, 2).toUpperCase();
    }
    const emailSeed = (user.email ?? '').replace('@', '');
    return emailSeed.slice(0, 2).toUpperCase() || 'MC';
  }, [user]);

  const roleLabel = useMemo(() => {
    if (!user?.role) {
      return null;
    }
    const mapping: Record<string, string> = {
      ADMIN: '管理者',
      USER: '一般',
      SUPER_ADMIN: 'スーパー管理者',
    };
    return mapping[user.role] ?? user.role;
  }, [user]);

  const accountEmail = user?.email ?? '';

  const handleLogout = useCallback(async () => {
    if (logoutLoading) {
      return;
    }
    setLogoutLoading(true);
    try {
      await logout();
      notifications.show({
        title: 'ログアウトしました',
        message: 'またのご利用をお待ちしています。',
        color: 'teal',
      });
      const params = new URLSearchParams();
      if (targetPath && targetPath !== '/') {
        params.set('returnTo', targetPath);
      }
      const nextUrl = params.size > 0 ? `/login?${params.toString()}` : '/login';
      router.replace(nextUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : '再度お試しください。';
      notifications.show({
        title: 'ログアウトに失敗しました',
        message,
        color: 'red',
      });
      setLogoutLoading(false);
    }
  }, [logout, logoutLoading, router, targetPath]);

  useEffect(() => {
    if (!initialized) return;
    if (isAuthPage && isAuthenticated) {
      router.replace('/');
    }
  }, [initialized, isAuthPage, isAuthenticated, router]);

  useEffect(() => {
    if (!initialized) return;
    if (requiresAuth && !isAuthenticated) {
      const params = new URLSearchParams();
      params.set('returnTo', targetPath);
      router.replace(`/login?${params.toString()}`);
    }
  }, [initialized, requiresAuth, isAuthenticated, router, targetPath]);

  // ルート遷移検知でサイドバー自動折りたたみ
  useEffect(() => {
    if (!requiresAuth) {
      return;
    }
    closeMobile();
    closeDesktop();
  }, [pathname, requiresAuth, closeMobile, closeDesktop]);

  if (!initialized || (requiresAuth && isLoading)) {
    return <FullScreenLoader />;
  }

  if (isAuthPage && isAuthenticated) {
    return <FullScreenLoader />;
  }

  if (requiresAuth && !isAuthenticated) {
    return <FullScreenLoader />;
  }

  if (!requiresAuth) {
    return <>{children}</>;
  }

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
            <Text fw={700} style={{ color: 'var(--text-primary)', fontSize: 18, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>🐈</span> MyCats
            </Text>
          </Group>
          {isAuthenticated && user ? (
            <Menu shadow="sm" width={220} position="bottom-end" withinPortal>
              <Menu.Target>
                <UnstyledButton
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.35rem 0.6rem',
                    borderRadius: '999px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--surface)',
                    transition: 'background-color 120ms ease',
                  }}
                >
                  <Avatar radius="xl" size={34} color="var(--accent)" variant="filled">
                    {accountInitials}
                  </Avatar>
                  <Stack gap={2} style={{ minWidth: 0 }} hiddenFrom="xs">
                    <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
                      <IconUser size={16} style={{ color: 'var(--text-muted)' }} />
                      <Text size="sm" fw={600} style={{ color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {accountLabel}
                      </Text>
                    </Group>
                    <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
                      {roleLabel && (
                        <Badge size="xs" variant="light" color="indigo">
                          {roleLabel}
                        </Badge>
                      )}
                      <Text size="xs" c="dimmed" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {accountEmail}
                      </Text>
                    </Group>
                  </Stack>
                  <IconChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>サインイン中</Menu.Label>
                <Box px="sm" py="xs">
                  <Text fw={600} size="sm" style={{ color: 'var(--text-primary)' }}>
                    {accountLabel}
                  </Text>
                  <Text size="xs" c="dimmed" mt={4}>
                    {accountEmail}
                  </Text>
                  {roleLabel && (
                    <Badge size="sm" mt="sm" variant="light" color="indigo">
                      {roleLabel}
                    </Badge>
                  )}
                </Box>
                <Menu.Divider />
                <Menu.Item
                  onClick={handleLogout}
                  leftSection={<IconLogout size={16} />}
                  disabled={logoutLoading}
                  color="red"
                >
                  ログアウト
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <Box style={{ width: 34, height: 34 }}>
              {/* 認証状態が整う前のプレースホルダー */}
            </Box>
          )}
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
        <BottomNavigation pathname={pathname} />
      </AppShell.Main>
    </AppShell>
  );
}

function BottomNavigation({ pathname }: { pathname: string }) {
  return (
    <Box
      component="footer"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        height: 64,
        backgroundColor: 'var(--surface)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 100,
        boxShadow: '0 -4px 12px rgba(15, 23, 42, 0.05)',
        color: 'var(--text-muted)',
      }}
    >
  {bottomNavigationItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Box
            key={item.href}
            component={Link}
            href={item.href}
            style={{
              textAlign: 'center',
              textDecoration: 'none',
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontSize: '0.8rem',
            }}
          >
            <Text size="xl">{item.icon}</Text>
            <Text
              size="xs"
              style={{
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: 500,
              }}
            >
              {item.label}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}

function FullScreenLoader() {
  return (
    <Center h="100vh" w="100%">
      <Loader size="lg" color="blue" />
    </Center>
  );
}
