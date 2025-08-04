/**
 * Xala UI Component Specifications Index
 * Central export for all component specifications
 * @version 1.0.0
 */

// Import JSON specifications
import * as AlertSpec from "./components/action-feedback/alert.spec.json";
import * as ButtonSpec from "./components/action-feedback/button.spec.json";
import * as ModalSpec from "./components/action-feedback/modal.spec.json";
import * as ToastSpec from "./components/action-feedback/toast.spec.json";

import * as BadgeSpec from "./components/data-display/badge.spec.json";
import * as DataTableSpec from "./components/data-display/data-table.spec.json";
import * as TooltipSpec from "./components/data-display/tooltip.spec.json";

import * as CheckboxSpec from "./components/form/checkbox.spec.json";
import * as DatePickerSpec from "./components/form/date-picker.spec.json";
import * as FormSpec from "./components/form/form.spec.json";
import * as InputSpec from "./components/form/input.spec.json";
import * as RadioSpec from "./components/form/radio.spec.json";
import * as SelectSpec from "./components/form/select.spec.json";
import * as SliderSpec from "./components/form/slider.spec.json";
import * as SwitchSpec from "./components/form/switch.spec.json";
import * as TextAreaSpec from "./components/form/textarea.spec.json";
import * as TimePickerSpec from "./components/form/time-picker.spec.json";

import * as CardSpec from "./components/layout/card.spec.json";
import * as ContainerSpec from "./components/layout/container.spec.json";
import * as GridSpec from "./components/layout/grid.spec.json";
import * as StackSpec from "./components/layout/stack.spec.json";

import * as BreadcrumbSpec from "./components/navigation/breadcrumb.spec.json";
import * as PaginationSpec from "./components/navigation/pagination.spec.json";
import * as SidebarSpec from "./components/navigation/sidebar.spec.json";
import * as TabsSpec from "./components/navigation/tabs.spec.json";
import * as WebNavbarSpec from "./components/navigation/web-navbar.spec.json";

import * as AccordionSpec from "./components/ui/accordion.spec.json";
import * as AvatarSpec from "./components/ui/avatar.spec.json";
import * as CalendarSpec from "./components/ui/calendar.spec.json";
import * as DialogSpec from "./components/ui/dialog.spec.json";
import * as DropdownSpec from "./components/ui/dropdown.spec.json";
import * as PopoverSpec from "./components/ui/popover.spec.json";
import * as ProgressSpec from "./components/ui/progress.spec.json";
import * as SkeletonSpec from "./components/ui/skeleton.spec.json";
import * as SpinnerSpec from "./components/ui/spinner.spec.json";
import * as TableSpec from "./components/ui/table.spec.json";

import * as ComponentRegistry from "./registry/component-registry.json";

// Re-export specifications
export {
	AlertSpec,
	ButtonSpec,
	ModalSpec,
	ToastSpec,
	BadgeSpec,
	DataTableSpec,
	TooltipSpec,
	CheckboxSpec,
	DatePickerSpec,
	FormSpec,
	InputSpec,
	RadioSpec,
	SelectSpec,
	SliderSpec,
	SwitchSpec,
	TextAreaSpec,
	TimePickerSpec,
	CardSpec,
	ContainerSpec,
	GridSpec,
	StackSpec,
	BreadcrumbSpec,
	PaginationSpec,
	SidebarSpec,
	TabsSpec,
	WebNavbarSpec,
	AccordionSpec,
	AvatarSpec,
	CalendarSpec,
	DialogSpec,
	DropdownSpec,
	PopoverSpec,
	ProgressSpec,
	SkeletonSpec,
	SpinnerSpec,
	TableSpec,
	ComponentRegistry,
};

// Type definitions for specifications - flexible to accommodate various formats
export interface ComponentSpecification {
	metadata: {
		name: string;
		version: string;
		category: string;
		description: string;
		[key: string]: any;
	};
	compliance?: any;
	props?: any;
	specification?: any;
	component?: any;
	variants?: any;
	accessibility?: any;
	platforms?: any;
	examples?: any;
	performance?: any;
	[key: string]: any;
}

// Utility function to get specification by name
export function getSpecificationByName(
	componentName: string,
): ComponentSpecification | undefined {
	const specs: Record<string, ComponentSpecification> = {
		Alert: AlertSpec,
		Button: ButtonSpec,
		Modal: ModalSpec,
		Toast: ToastSpec,
		Badge: BadgeSpec,
		DataTable: DataTableSpec,
		Tooltip: TooltipSpec,
		Checkbox: CheckboxSpec,
		DatePicker: DatePickerSpec,
		Form: FormSpec,
		Input: InputSpec,
		Radio: RadioSpec,
		Select: SelectSpec,
		Slider: SliderSpec,
		Switch: SwitchSpec,
		TextArea: TextAreaSpec,
		TimePicker: TimePickerSpec,
		Card: CardSpec,
		Container: ContainerSpec,
		Grid: GridSpec,
		Stack: StackSpec,
		Breadcrumb: BreadcrumbSpec,
		Pagination: PaginationSpec,
		Sidebar: SidebarSpec,
		Tabs: TabsSpec,
		WebNavbar: WebNavbarSpec,
		Accordion: AccordionSpec,
		Avatar: AvatarSpec,
		Calendar: CalendarSpec,
		Dialog: DialogSpec,
		Dropdown: DropdownSpec,
		Popover: PopoverSpec,
		Progress: ProgressSpec,
		Skeleton: SkeletonSpec,
		Spinner: SpinnerSpec,
		Table: TableSpec,
	};

	return specs[componentName];
}

// Get all specifications as an array
export function getAllSpecifications(): ComponentSpecification[] {
	return [
		AlertSpec,
		ButtonSpec,
		ModalSpec,
		ToastSpec,
		BadgeSpec,
		DataTableSpec,
		TooltipSpec,
		CheckboxSpec,
		DatePickerSpec,
		FormSpec,
		InputSpec,
		RadioSpec,
		SelectSpec,
		SliderSpec,
		SwitchSpec,
		TextAreaSpec,
		TimePickerSpec,
		CardSpec,
		ContainerSpec,
		GridSpec,
		StackSpec,
		BreadcrumbSpec,
		PaginationSpec,
		SidebarSpec,
		TabsSpec,
		WebNavbarSpec,
		AccordionSpec,
		AvatarSpec,
		CalendarSpec,
		DialogSpec,
		DropdownSpec,
		PopoverSpec,
		ProgressSpec,
		SkeletonSpec,
		SpinnerSpec,
		TableSpec,
	];
}

// Get specifications by category
export function getSpecificationsByCategory(
	category: string,
): ComponentSpecification[] {
	return getAllSpecifications().filter(
		(spec) => spec.metadata.category === category,
	);
}

// Component categories
export const COMPONENT_CATEGORIES = [
	"action-feedback",
	"data-display",
	"form",
	"layout",
	"navigation",
	"ui",
] as const;

export type ComponentCategory = (typeof COMPONENT_CATEGORIES)[number];

// Export count for validation
export const TOTAL_SPECIFICATIONS = 36;
