"use client";

import Link from "next/link";
import { Container } from "@/components/common/Container";
import { useEffect, useState } from "react";
import type { User } from "@/types/user";

const navItems = [
	{ label: "Početna", href: "/" },
	{ label: "Oglasi", href: "/AllItems" },
	{ label: "Mapa", href: "/map" },
];
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
export function Header() {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [currentUser, setCurrentUser] = useState<User | null>(null);

	 useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          setIsLoggedIn(false);
          setCurrentUser(null);
          return;
        }

        setIsLoggedIn(true);

        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          localStorage.removeItem("access_token");
          setIsLoggedIn(false);
          setCurrentUser(null);
          return;
        }

        setCurrentUser(data);
      } catch {
        localStorage.removeItem("access_token");
        setIsLoggedIn(false);
        setCurrentUser(null);
      } finally {
      }
    };

    fetchCurrentUser();
  }, []);

	const handleLogout = () => {
		localStorage.removeItem("access_token");
		setIsLoggedIn(false);
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
							<Link
								key={item.href}
								href={item.href}
								className="site-header__link"
							>
								{item.label}
							</Link>
						))}
					</nav>
				</div>
				<div className="site-header__actions">
					{isLoggedIn ? (
						<>
							<Link href="/profile" className="site-header__action">
								Moj profil
							</Link>
							{currentUser?.is_admin ? (
							<Link
							href="/admin"
							className="site-header__action site-header__action--outline"
							>
							Admin panel
							</Link>) : (<Link
							href="/AddItem"
							className="site-header__action site-header__action--outline"
							>
							Dodaj oglas
							</Link>) }
							
							<button
								type="button"
								className="site-header__action"
								onClick={handleLogout}
							>
								Odjava
							</button>
						</>
					) : (
						<>
							<Link href="/login" className="site-header__action">
								Login
							</Link>
							<Link
								href="/register"
								className="site-header__action site-header__action--outline"
							>
								Registracija
							</Link>
						</>
					)}
				</div>
				<div className="site-header__mobile">
					{isLoggedIn && (
						<>
							<Link href="/AddItem" className="btn btn--primary btn--xs">
								Dodaj oglas
							</Link>
							<button
								type="button"
								className="site-header__action"
								onClick={handleLogout}
							>
								Odjava
							</button>
						</>
					)}
				</div>
			</Container>
		</header>
	);
}
