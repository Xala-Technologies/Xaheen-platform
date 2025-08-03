"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const NpmPackage = () => {
	const [version, setVersion] = useState("");
	const [versionLoading, setVersionLoading] = useState(true);

	useEffect(() => {
		const getLatestVersion = async () => {
			setVersionLoading(true);
			try {
				const res = await fetch(
					"https://api.github.com/repos/Xala-Technologies/Xaheen-platform/releases",
				);
				if (!res.ok) throw new Error("Failed to fetch version");
				const data = await res.json();
				if (data && data.length > 0) {
					// Handle different tag formats: v1.0.0, 1.0.0, @scope/package@1.0.0
					let latestVersion = data[0].tag_name;
					
					// Remove 'v' prefix if present
					if (latestVersion.startsWith('v')) {
						latestVersion = latestVersion.substring(1);
					}
					
					// Handle @scope/package@version format
					if (latestVersion.includes('@') && latestVersion.split('@').length > 1) {
						latestVersion = latestVersion.split('@').pop();
					}
					
					setVersion(latestVersion);
				} else {
					setVersion("?.?.?");
				}
			} catch (error) {
				console.error("Error fetching NPM version:", error);
				setVersion("?.?.?");
			} finally {
				setVersionLoading(false);
			}
		};
		getLatestVersion();
	}, []);

	return (
		<div className="mt-2 flex items-center justify-center">
			<span
				className={cn(
					"mr-2 inline-block h-5 w-3 bg-primary",
					versionLoading && "animate-pulse",
				)}
			/>
			<span className=" text-muted-foreground text-xl">
				{versionLoading ? "[v?.?.?]" : `[v${version}]`}
			</span>
		</div>
	);
};

export default NpmPackage;
