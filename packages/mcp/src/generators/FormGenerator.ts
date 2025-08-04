/**
 * Form Generator for Xala UI System
 */

import type { FormConfig } from "../types/index.js";

export class FormGenerator {
	public generateForm(config: FormConfig): string {
		const { name, fields, validation, submission } = config;

		const fieldComponents = fields
			.map((field) => {
				switch (field.type) {
					case "input":
						return `
            <Input
              name="${field.name}"
              label="${field.label}"
              required={${field.required || false}}
              placeholder={t('form.${field.name}.placeholder')}
            />`;
					case "textarea":
						return `
            <Textarea
              name="${field.name}"
              label="${field.label}"
              required={${field.required || false}}
              placeholder={t('form.${field.name}.placeholder')}
            />`;
					case "select":
						return `
            <Select
              name="${field.name}"
              label="${field.label}"
              required={${field.required || false}}
              options={${field.name}Options}
            />`;
					default:
						return `<Input name="${field.name}" label="${field.label}" />`;
				}
			})
			.join("\n");

		return `
import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Form, 
  Input, 
  Textarea, 
  Select, 
  Button, 
  Stack,
  useTokens 
} from '@xala-technologies/ui-system';

export interface ${name}Props {
  onSubmit?: (data: Record<string, unknown>) => void;
  onCancel?: () => void;
}

export function ${name}({ onSubmit, onCancel }: ${name}Props): JSX.Element {
  const { t } = useTranslation();
  const tokens = useTokens();

  const handleSubmit = (data: Record<string, unknown>): void => {
    if (onSubmit) {
      onSubmit(data);
    }
  };

  return (
    <Form
      onSubmit={handleSubmit}
      validation={${JSON.stringify(validation)}}
    >
      <Stack direction="vertical" gap={tokens.spacing.md}>
        ${fieldComponents}
        
        <Stack direction="horizontal" gap={tokens.spacing.sm} justify="end">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              {t('common.cancel')}
            </Button>
          )}
          <Button type="submit" variant="default">
            {t('common.submit')}
          </Button>
        </Stack>
      </Stack>
    </Form>
  );
}`;
	}

	/**
	 * Generate a complete form using form component specifications (async version for MCP tools)
	 */
	public async generateAdvancedForm(config: {
		name: string;
		fields: Array<{
			component: string;
			name: string;
			label?: string;
			required?: boolean;
			validation?: any;
			specification?: any;
		}>;
		layout: "vertical" | "horizontal" | "inline" | "grid";
		validation: boolean;
		norwegianCompliance: boolean;
	}): Promise<string> {
		const { name, fields, layout, norwegianCompliance } = config;

		const formCode = `
/**
 * Generated Form: ${name}
 * Layout: ${layout}
 * Norwegian Compliance: ${norwegianCompliance}
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { t } from '@xala-technologies/ui-system/i18n';
${fields.map((field) => `import { ${field.component} } from '@xala-technologies/ui-system';`).join("\n")}

// Form validation schema
const ${name}Schema = z.object({
${fields
	.map((field) => {
		const zodType =
			field.component === "Input"
				? "z.string()"
				: field.component === "Checkbox"
					? "z.boolean()"
					: field.component === "Select"
						? "z.string()"
						: "z.string()";
		const validation = field.required ? zodType : `${zodType}.optional()`;
		return `  ${field.name}: ${validation}`;
	})
	.join(",\n")}
});

type ${name}Data = z.infer<typeof ${name}Schema>;

interface ${name}Props {
  readonly onSubmit: (data: ${name}Data) => void;
  readonly initialData?: Partial<${name}Data>;
  readonly loading?: boolean;
}

export const ${name}: React.FC<${name}Props> = ({
  onSubmit,
  initialData,
  loading = false
}) => {
  const { register, handleSubmit, formState: { errors }, control } = useForm<${name}Data>({
    resolver: zodResolver(${name}Schema),
    defaultValues: initialData
  });

  const layoutClass = {
    vertical: 'space-y-4',
    horizontal: 'flex flex-wrap gap-4',
    inline: 'flex items-center gap-2',
    grid: 'grid grid-cols-1 md:grid-cols-2 gap-4'
  }['${layout}'];

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)}
      className={\`\${layoutClass} p-6 bg-background rounded-lg border\`}
      aria-label={t('${name.toLowerCase()}.formLabel')}
    >
      <h2 className="text-xl font-semibold mb-4">
        {t('${name.toLowerCase()}.title')}
      </h2>
      
${fields
	.map(
		(field) => `
      <div className="space-y-2">
        <label 
          htmlFor="${field.name}" 
          className="block text-sm font-medium text-foreground"
        >
          {t('${name.toLowerCase()}.${field.name}.label')}
          ${field.required ? '<span className="text-red-500 ml-1">*</span>' : ""}
        </label>
        <${field.component}
          id="${field.name}"
          {...register('${field.name}')}
          placeholder={t('${name.toLowerCase()}.${field.name}.placeholder')}
          error={errors.${field.name}?.message}
          aria-describedby={errors.${field.name} ? '${field.name}-error' : undefined}
          ${field.required ? "required" : ""}
        />
        {errors.${field.name} && (
          <p 
            id="${field.name}-error"
            className="text-sm text-red-600"
            role="alert"
          >
            {errors.${field.name}?.message}
          </p>
        )}
      </div>`,
	)
	.join("\n")}
      
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          className="px-4 py-2 border border-border rounded-md hover:bg-accent"
          onClick={() => window.history.back()}
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          aria-describedby={loading ? 'submit-loading' : undefined}
        >
          {loading ? t('common.submitting') : t('common.submit')}
        </button>
      </div>
      
      {loading && (
        <div id="submit-loading" className="sr-only">
          {t('common.submittingAriaLabel')}
        </div>
      )}
    </form>
  );
};

${name}.displayName = '${name}';
`;

		return formCode;
	}
}
