import type { BaseLayoutProps, LinkItemType } from "fumadocs-ui/layouts/shared";
import Image from "next/image";
import discordLogo from "@/public/icon/discord.svg";
import npmLogo from "@/public/icon/npm.svg";
import xLogo from "@/public/icon/x.svg";
import mainLogo from "@/public/logo.svg";

export const logo = (
	<>
		<Image
			alt="Xaheen"
			src={mainLogo}
			className="w-8"
			aria-label="Xaheen"
		/>
	</>
);

export const links: LinkItemType[] = [
	{
		text: "Docs",
		url: "/docs",
		active: "nested-url" as const,
	},
	{
		text: "Builder",
		url: "/new",
	},
	{
		text: "Analytics",
		url: "/analytics",
	},
	{
		text: "Showcase",
		url: "/showcase",
	},
	{
		text: "GitHub Packages",
		icon: (
			<Image src={npmLogo} alt="npm" className="size-4 invert-0 dark:invert" />
		),
		label: "GitHub Packages",
		type: "icon",
		url: "https://github.com/Xala-Technologies/Xaheen-platform/pkgs/npm/xaheen",
		external: true,
		secondary: true,
	},
	{
		text: "Xala Technologies",
		icon: (
			<Image
				src={discordLogo}
				alt="discord"
				className="size-5 invert-0 dark:invert"
			/>
		),
		label: "Xala Technologies",
		type: "icon",
		url: "https://xala.no",
		external: true,
		secondary: true,
	},
];

export const baseOptions: BaseLayoutProps = {
	nav: {
		title: (
			<>
				{logo}
				<span className="font-medium [.uwu_&]:hidden [header_&]:text-[15px]">
					Xaheen
				</span>
			</>
		),
	},
	links: links,
	githubUrl: "https://github.com/Xala-Technologies/Xaheen-platform",
};
