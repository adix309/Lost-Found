import Link from "next/link";
import { Container } from "@/components/common/Container";

const navItems = [
	{ label: "Početna", href: "/" },
	{ label: "Oglasi", href: "/listings" },
	{ label: "Mapa", href: "/map" },
	{ label: "Kako funkcioniše", href: "/#kako-funkcionise" },
];

export function Header() {
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
					<Link href="/login" className="site-header__action">
						Login
					</Link>
					<Link
						href="/register"
						className="site-header__action site-header__action--outline"
					>
						Registracija
					</Link>
					<Link
						href="/listings/new"
						className="btn btn--primary btn--sm"
					>
						Dodaj oglas
					</Link>
				</div>
				<div className="site-header__mobile">
					<Link href="/listings/new" className="btn btn--primary btn--xs">
						Dodaj oglas
					</Link>
				</div>
			</Container>
		</header>
	);
}
