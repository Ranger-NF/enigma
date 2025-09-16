import { useState } from "react";
import { Navbar01 } from "@/components/ui/shadcn-io/navbar-01";

export default function Rules() {
	const [data, setData] = useState("");

	const navLinks: Navbar01NavLink[] = [
		{ href: '/', label: 'Home' },
		{ href: '/rules', label: 'Rules', active: true },
		{ href: '/leaderboard', label: 'Leaderboard' },
		{ href: '/', label: 'Contact' },
	];

	return (
		<div className="relative w-full">
			<Navbar01 navigationLinks={navLinks} />
		</div>
	);
}
