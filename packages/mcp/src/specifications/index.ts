/**
 * Xala UI Component Specifications Index
 * Central export for all component specifications
 * @version 1.0.0
 */

// Import JSON specifications
import AlertSpec from "./components/action-feedback/alert.spec.json" with { type: "json" };
import ButtonSpec from "./components/action-feedback/button.spec.json" with { type: "json" };
import ModalSpec from "./components/action-feedback/modal.spec.json" with { type: "json" };
import ToastSpec from "./components/action-feedback/toast.spec.json" with { type: "json" };

import BadgeSpec from "./components/data-display/badge.spec.json" with { type: "json" };
import DataTableSpec from "./components/data-display/data-table.spec.json" with { type: "json" };
import TooltipSpec from "./components/data-display/tooltip.spec.json" with { type: "json" };

import CheckboxSpec from "./components/form/checkbox.spec.json" with { type: "json" };
import DatePickerSpec from "./components/form/date-picker.spec.json" with { type: "json" };
import FormSpec from "./components/form/form.spec.json" with { type: "json" };
import InputSpec from "./components/form/input.spec.json" with { type: "json" };
import RadioSpec from "./components/form/radio.spec.json" with { type: "json" };
import SelectSpec from "./components/form/select.spec.json" with { type: "json" };
import SliderSpec from "./components/form/slider.spec.json" with { type: "json" };
import SwitchSpec from "./components/form/switch.spec.json" with { type: "json" };
import TextAreaSpec from "./components/form/textarea.spec.json" with { type: "json" };
import TimePickerSpec from "./components/form/time-picker.spec.json" with { type: "json" };

import CardSpec from "./components/layout/card.spec.json" with { type: "json" };
import ContainerSpec from "./components/layout/container.spec.json" with { type: "json" };
import GridSpec from "./components/layout/grid.spec.json" with { type: "json" };
import StackSpec from "./components/layout/stack.spec.json" with { type: "json" };

import BreadcrumbSpec from "./components/navigation/breadcrumb.spec.json" with { type: "json" };
import PaginationSpec from "./components/navigation/pagination.spec.json" with { type: "json" };
import SidebarSpec from "./components/navigation/sidebar.spec.json" with { type: "json" };
import TabsSpec from "./components/navigation/tabs.spec.json" with { type: "json" };
import WebNavbarSpec from "./components/navigation/web-navbar.spec.json" with { type: "json" };

import AccordionSpec from "./components/ui/accordion.spec.json" with { type: "json" };
import AvatarSpec from "./components/ui/avatar.spec.json" with { type: "json" };
import CalendarSpec from "./components/ui/calendar.spec.json" with { type: "json" };
import DialogSpec from "./components/ui/dialog.spec.json" with { type: "json" };
import DropdownSpec from "./components/ui/dropdown.spec.json" with { type: "json" };
import PopoverSpec from "./components/ui/popover.spec.json" with { type: "json" };
import ProgressSpec from "./components/ui/progress.spec.json" with { type: "json" };
import SkeletonSpec from "./components/ui/skeleton.spec.json" with { type: "json" };
import SpinnerSpec from "./components/ui/spinner.spec.json" with { type: "json" };
import TableSpec from "./components/ui/table.spec.json" with { type: "json" };

import ComponentRegistry from "./registry/component-registry.json" with { type: "json" };

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
