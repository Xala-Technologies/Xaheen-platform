// components/layouts/DashboardLayout.tsx
import {
	Container,
	Stack,
	Typography,
	useTokens,
	WebContent,
	WebFooter,
	WebLayout,
	WebNavbar,
} from "@xala-technologies/ui-system";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export interface DashboardLayoutProps {
	readonly children: ReactNode;
	readonly showNavbar?: boolean;
	readonly showFooter?: boolean;
	readonly navbarProps?: any;
	readonly footerProps?: any;
}

export function DashboardLayout({
	children,
	showNavbar = true,
	showFooter = true,
	navbarProps = {},
	footerProps = {},
}: DashboardLayoutProps): JSX.Element {
	const { t } = useTranslation();
	const { colors, spacing } = useTokens();

	return (
		<WebLayout>
			{showNavbar && (
				<WebNavbar
					logo={
						<Typography variant="h3" weight="bold">
							{t("brand.name")}
						</Typography>
					}
					navigation={[
						{
							key: "home",
							label: t("nav.home"),
							href: "/",
						},
						{
							key: "about",
							label: t("nav.about"),
							href: "/about",
						},
						{
							key: "contact",
							label: t("nav.contact"),
							href: "/contact",
						},
					]}
					{...navbarProps}
				/>
			)}

			<WebContent>
				<Container size="xl" padding="lg">
					{children}
				</Container>
			</WebContent>

			{showFooter && (
				<WebFooter
					links={[
						{ label: t("footer.privacy"), href: "/privacy" },
						{ label: t("footer.terms"), href: "/terms" },
						{ label: t("footer.support"), href: "/support" },
					]}
					{...footerProps}
				/>
			)}
		</WebLayout>
	);
}
