/**
 * Web Deployment Technology Options
 * Single Responsibility: Web deployment platforms and services
 */

import { TechStackOption } from "../models";

export const WEBDEPLOY_OPTIONS = [
	new TechStackOption(
		"vercel",
		"Vercel",
		"Deploy web apps with zero configuration",
		"/icon/vercel.svg",
		"from-black to-gray-800",
		true,
	),
	new TechStackOption(
		"netlify",
		"Netlify",
		"Deploy and host static sites and serverless functions",
		"/icon/netlify.svg",
		"from-teal-500 to-teal-700",
	),
	new TechStackOption(
		"railway",
		"Railway",
		"Deploy and scale apps with ease",
		"/icon/railway.svg",
		"from-purple-500 to-purple-700",
	),
	new TechStackOption(
		"render",
		"Render",
		"Cloud platform for developers and teams",
		"/icon/render.svg",
		"from-green-500 to-green-700",
	),
	new TechStackOption(
		"fly",
		"Fly.io",
		"Deploy apps close to your users",
		"/icon/fly.svg",
		"from-purple-600 to-purple-800",
	),
	new TechStackOption(
		"cloudflare-pages",
		"Cloudflare Pages",
		"JAMstack platform with global edge network",
		"/icon/cloudflare.svg",
		"from-orange-500 to-orange-700",
	),
	new TechStackOption(
		"aws-amplify",
		"AWS Amplify",
		"Full-stack development platform",
		"/icon/aws.svg",
		"from-orange-400 to-orange-600",
	),
	new TechStackOption(
		"azure-static-web-apps",
		"Azure Static Web Apps",
		"Modern web app service from Microsoft",
		"/icon/azure.svg",
		"from-blue-500 to-blue-700",
	),
	new TechStackOption(
		"github-pages",
		"GitHub Pages",
		"Host static sites directly from GitHub",
		"/icon/github.svg",
		"from-gray-700 to-black",
	),
	new TechStackOption(
		"heroku",
		"Heroku",
		"Cloud platform as a service",
		"/icon/heroku.svg",
		"from-purple-600 to-purple-800",
	),
	new TechStackOption(
		"digitalocean",
		"DigitalOcean App Platform",
		"Platform as a Service from DigitalOcean",
		"/icon/digitalocean.svg",
		"from-blue-500 to-blue-700",
	),
	new TechStackOption(
		"none",
		"No Deployment",
		"Skip deployment configuration",
		"",
		"from-gray-400 to-gray-600",
	),
];
