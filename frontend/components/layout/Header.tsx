"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Container } from "@/components/common/Container";
import type { User } from "@/types/user";
import type { NotificationItem, NotificationListResponse } from "@/types/notification";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";

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

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          setIsLoggedIn(false);
          setCurrentUser(null);
          setNotifications([]);
          return;
        }

        const [userRes, notificationsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/notifications/me?limit=20&offset=0`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!userRes.ok) {
          localStorage.removeItem("access_token");
          setIsLoggedIn(false);
          setCurrentUser(null);
          setNotifications([]);
          return;
        }

        const userData = (await userRes.json().catch(() => null)) as User | null;
        const notificationsData = notificationsRes.ok
          ? ((await notificationsRes.json().catch(() => ({ items: [] }))) as NotificationListResponse)
          : { items: [] };

        setIsLoggedIn(true);
        setCurrentUser(userData);
        setNotifications(notificationsData.items ?? []);
      } catch {
        localStorage.removeItem("access_token");
        setIsLoggedIn(false);
        setCurrentUser(null);
        setNotifications([]);
      }
    };

    fetchSessionData();
  }, []);

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

  return (
    <header className="site-header">
      <Container className="site-header__inner">
        <div className="site-header__brand">
          <Link href="/" className="site-header__logo">
            Lost & Found
          </Link>
          <nav className="site-header__nav">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="site-header__link">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="site-header__actions">
          {isLoggedIn ? (
            <>
              <Link href="/notifications" className="site-header__notification" aria-label="Notifikacije">
                <FontAwesomeIcon icon={faBell} />
                {unreadCount > 0 && <span className="site-header__notification-badge" />}
              </Link>

              <Link href="/profile" className="site-header__action">
                Moj profil
              </Link>

              {currentUser?.is_admin ? (
                <Link href="/admin" className="site-header__action site-header__action--outline">
                  Admin panel
                </Link>
              ) : (
                <Link href="/AddItem" className="site-header__action site-header__action--outline">
                  Dodaj oglas
                </Link>
              )}

              <button type="button" className="site-header__action" onClick={handleLogout}>
                Odjava
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="site-header__action">
                Login
              </Link>
              <Link href="/register" className="site-header__action site-header__action--outline">
                Registracija
              </Link>
            </>
          )}
        </div>

        <div className="site-header__mobile">
          {isLoggedIn && (
            <>
              <Link href="/notifications" className="site-header__notification" aria-label="Notifikacije">
				<FontAwesomeIcon icon={faBell} />
				{unreadCount > 0 && <span className="site-header__notification-badge" />}
			  </Link>

              <Link href="/AddItem" className="btn btn--primary btn--xs">
                Dodaj oglas
              </Link>

              <button type="button" className="site-header__action" onClick={handleLogout}>
                Odjava
              </button>
            </>
          )}
        </div>
      </Container>
    </header>
  );
}