"use client";

import Link from "next/link";
import { Container } from "@/components/common/Container";
import { useEffect, useState } from "react";

const navItems = [
	{ label: "Početna", href: "/" },
	{ label: "Oglasi", href: "/AllItems" },
	{ label: "Mapa", href: "/map" },
];

export function Header() {
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	useEffect(() => {
		const token = localStorage.getItem("access_token");
		setIsLoggedIn(Boolean(token));
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
							<Link href="/AddItem" className="btn btn--primary btn--sm">
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
