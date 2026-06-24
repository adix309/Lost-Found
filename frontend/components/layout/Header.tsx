"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import ForumIcon from "@mui/icons-material/Forum";
import PersonIcon from "@mui/icons-material/Person";
import Fab from "@mui/material/Fab";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import { usePathname } from "next/navigation";
import type { User } from "@/types/user";
import type { NotificationItem, NotificationListResponse } from "@/types/notification";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";

type ChatListItem = {
  conversationId: number;
  item: {
    id: number | null;
    title: string;
    imageUrl: string | null;
  };
  otherUser: {
    id: number | null;
    username: string;
    firstName: string;
    lastName: string;
  };
  lastMessage: {
    content: string;
    senderId: number;
    createdAt: string;
  } | null;
  updatedAt: string;
};

const navItems = [
  { label: "Početna", href: "/" },
  { label: "Oglasi", href: "/AllItems" },
  { label: "Mapa", href: "/map" },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadChatsCount, setUnreadChatsCount] = useState(0);
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          setIsLoggedIn(false);
          setCurrentUser(null);
          setNotifications([]);
          setUnreadChatsCount(0);
          return;
        }

        const [userRes, notificationsRes, conversationsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/notifications/me?limit=20&offset=0`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/conversations/my`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => null),
        ]);

        if (!userRes.ok) {
          localStorage.removeItem("access_token");
          setIsLoggedIn(false);
          setCurrentUser(null);
          setNotifications([]);
          setUnreadChatsCount(0);
          return;
        }

        const userData = (await userRes.json().catch(() => null)) as User | null;
        const notificationsData = notificationsRes.ok
          ? ((await notificationsRes.json().catch(() => ({ items: [] }))) as NotificationListResponse)
          : { items: [] };

        const conversationsData = conversationsRes && conversationsRes.ok
          ? ((await conversationsRes.json().catch(() => [])) as ChatListItem[])
          : [];

        setIsLoggedIn(true);
        setCurrentUser(userData);
        setNotifications(notificationsData.items ?? []);

        if (userData) {
          let unread = 0;
          conversationsData.forEach((chat) => {
            if (chat.lastMessage && chat.lastMessage.senderId !== userData.id) {
              const lastRead = localStorage.getItem(`chat_read_${chat.conversationId}`);
              if (!lastRead || new Date(chat.lastMessage.createdAt) > new Date(lastRead)) {
                unread++;
              }
            }
          });
          setUnreadChatsCount(unread);
        }
      } catch {
        localStorage.removeItem("access_token");
        setIsLoggedIn(false);
        setCurrentUser(null);
        setNotifications([]);
        setUnreadChatsCount(0);
      }
    };

    fetchSessionData();
  }, [pathname]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications]
  );

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    setCurrentUser(null);
    setNotifications([]);
    window.location.replace("/");
  };

  const showFab = isLoggedIn && pathname !== "/AllChats" && !pathname?.startsWith("/chat");

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(16px)",
          color: "text.primary",
          borderBottom: "1px solid",
          borderColor: "grey.200",
          boxShadow: "0 1px 3px rgba(28, 25, 23, 0.02)",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ height: "4.5rem", justifyContent: "space-between" }}>
            {/* Logo & Desktop Nav */}
            <Stack direction="row" spacing={4} sx={{ alignItems: "center" }}>
              <Typography
                component={Link}
                href="/"
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: "primary.main",
                  letterSpacing: "-0.02em",
                  textDecoration: "none",
                }}
              >
                Lost & Found
              </Typography>

              <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1.5 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.href}
                    component={Link}
                    href={item.href}
                    sx={{
                      color: "text.secondary",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      "&:hover": {
                        color: "primary.main",
                        backgroundColor: "primary.light",
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            </Stack>

            {/* Desktop & Mobile Actions */}
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              {isLoggedIn ? (
                <>
                  <IconButton
                    component={Link}
                    href="/notifications"
                    aria-label="Notifikacije"
                    sx={{
                      backgroundColor: "grey.100",
                      borderRadius: 3,
                      color: "text.secondary",
                      "&:hover": {
                        color: "primary.main",
                        backgroundColor: "primary.light",
                      },
                    }}
                  >
                    <Badge color="error" variant="dot" invisible={unreadCount === 0}>
                      <FontAwesomeIcon icon={faBell} style={{ fontSize: "1.1rem" }} />
                    </Badge>
                  </IconButton>

                  <Tooltip title="Razgovori">
                    <IconButton
                      component={Link}
                      href="/AllChats"
                      aria-label="Razgovori"
                      sx={{
                        backgroundColor: "grey.100",
                        borderRadius: 3,
                        color: "text.secondary",
                        "&:hover": {
                          color: "primary.main",
                          backgroundColor: "primary.light",
                        },
                      }}
                    >
                      <Badge color="error" badgeContent={unreadChatsCount} invisible={unreadChatsCount === 0}>
                        <ForumIcon sx={{ fontSize: "1.1rem" }} />
                      </Badge>
                    </IconButton>
                  </Tooltip>

                  {currentUser?.is_admin ? (
                    <Button
                      component={Link}
                      href="/admin"
                      variant="outlined"
                      color="primary"
                      size="small"
                    >
                      Admin panel
                    </Button>
                  ) : (
                    <Button
                      component={Link}
                      href="/AddItem"
                      variant="contained"
                      color="primary"
                      size="small"
                      sx={{ display: { xs: "none", sm: "inline-flex" } }}
                    >
                      Dodaj oglas
                    </Button>
                  )}

                  <Tooltip title="Korisnički meni">
                    <IconButton
                      onClick={handleMenuClick}
                      size="small"
                      aria-controls={openMenu ? "account-menu" : undefined}
                      aria-haspopup="true"
                      aria-expanded={openMenu ? "true" : undefined}
                      aria-label="Account menu"
                      sx={{
                        ml: 0.5,
                        "&:focus-visible": {
                          outline: "2px solid",
                          outlineColor: "primary.main",
                        }
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                        }}
                      >
                        <PersonIcon />
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={anchorEl}
                    id="account-menu"
                    open={openMenu}
                    onClose={handleMenuClose}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                    slotProps={{
                      paper: {
                        elevation: 0,
                        sx: {
                          overflow: "visible",
                          filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.12))",
                          mt: 1.5,
                          border: "1px solid",
                          borderColor: "grey.200",
                          borderRadius: 2,
                          "&::before": {
                            content: '""',
                            display: "block",
                            position: "absolute",
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: "background.paper",
                            transform: "translateY(-50%) rotate(45deg)",
                            zIndex: 0,
                            borderTop: "1px solid",
                            borderLeft: "1px solid",
                            borderColor: "grey.200",
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem
                      component={Link}
                      href="/profile"
                      onClick={handleMenuClose}
                      sx={{ fontWeight: 600, color: "text.primary" }}
                    >
                      Moj profil
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleMenuClose();
                        handleLogout();
                      }}
                      sx={{ fontWeight: 600, color: "error.main" }}
                    >
                      Odjava
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button
                    component={Link}
                    href="/login"
                    sx={{
                      color: "text.secondary",
                      fontWeight: 600,
                    }}
                  >
                    Prijava
                  </Button>
                  <Button
                    component={Link}
                    href="/register"
                    variant="contained"
                    color="primary"
                    size="small"
                  >
                    Registracija
                  </Button>
                </>
              )}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {showFab && (
        <Tooltip title="Razgovori" placement="left">
          <Fab
            component={Link}
            href="/AllChats"
            color="primary"
            aria-label="Razgovori"
            sx={{
              position: "fixed",
              bottom: 24,
              right: 24,
              zIndex: 1100,
              boxShadow: "0 4px 14px rgba(27, 77, 62, 0.3)",
              "&:hover": {
                transform: "scale(1.05)",
                transition: "transform 0.2s ease-in-out",
              },
            }}
          >
            <Badge color="error" badgeContent={unreadChatsCount} invisible={unreadChatsCount === 0}>
              <ForumIcon sx={{ fontSize: "1.4rem" }} />
            </Badge>
          </Fab>
        </Tooltip>
      )}
    </>
  );
}