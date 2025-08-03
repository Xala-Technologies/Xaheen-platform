import { Github } from "lucide-react";
import Link from "next/link";

const Footer = () => {
	return (
		<footer className="relative w-full border-border border-t">
			<div className="container mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
				<div className="flex flex-col items-center justify-between gap-4 border-border border-t pt-6 sm:flex-row sm:gap-6 sm:pt-8">
					<p className="text-center text-muted-foreground text-xs sm:text-left sm:text-sm">
						© {new Date().getFullYear()} Xaheen-Builder. All rights reserved.
					</p>
					<p className="flex items-center gap-1.5 text-muted-foreground text-xs sm:text-sm">
						Built with
						<span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text font-medium text-transparent">
							TypeScript
						</span>
					</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
