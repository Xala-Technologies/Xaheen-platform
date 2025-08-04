
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

export interface ContactFormProps {
  onSubmit?: (data: Record<string, unknown>) => void;
  onCancel?: () => void;
}

export function ContactForm({ onSubmit, onCancel }: ContactFormProps): JSX.Element {
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
      validation={{"realTime":true,"showErrors":true,"errorPosition":"inline"}}
    >
      <Stack direction="vertical" gap={tokens.spacing.md}>
        
            <Input
              name="name"
              label="Name"
              required={true}
              placeholder={t('form.name.placeholder')}
            />

            <Input
              name="email"
              label="Email"
              required={true}
              placeholder={t('form.email.placeholder')}
            />
        
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
}