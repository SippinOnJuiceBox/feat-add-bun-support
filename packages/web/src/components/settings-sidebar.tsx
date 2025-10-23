/** biome-ignore-all lint/correctness/useUniqueElementIds: <not relevant> */
'use client';

import { AlertCircle, Settings, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQueryParamConfig, useUpdateConfigQueryParams } from '@/lib/config';
import {
  type ValidationError,
  validateWorldConfig,
  type WorldConfig,
} from '@/lib/config-world';

export function SettingsSidebar() {
  const config = useQueryParamConfig();
  const updateConfig = useUpdateConfigQueryParams();

  const [isOpen, setIsOpen] = useState(false);
  const [localConfig, setLocalConfig] = useState<WorldConfig>(config);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const backend = localConfig.backend || 'embedded';
  const isEmbedded = backend === 'embedded';

  // Update local config when query params change
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleValidateAndApply = async () => {
    setIsValidating(true);
    try {
      const validationErrors = await validateWorldConfig(localConfig);
      setErrors(validationErrors);

      if (validationErrors.length === 0) {
        updateConfig(localConfig);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Validation error:', error);
      setErrors([
        {
          field: 'general',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      ]);
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = (field: keyof WorldConfig, value: string) => {
    setLocalConfig((prev) => ({ ...prev, [field]: value }));
    // Clear errors for this field when user types
    setErrors((prev) => prev.filter((e) => e.field !== field));
  };

  const getFieldError = (field: string) => {
    return errors.find((e) => e.field === field)?.message;
  };

  const hasChanges =
    JSON.stringify(localConfig) !== JSON.stringify(config) || errors.length > 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full hover:bg-accent transition-colors"
        title="Configuration"
      >
        <Settings className="h-6 w-6" />
      </button>
      {isOpen && (
        <>
          {/* Backdrop */}
          <button
            type="button"
            className="fixed inset-0 bg-black/50 z-40 cursor-default"
            onClick={() => setIsOpen(false)}
            aria-label="Close configuration panel"
          />

          {/* Panel */}
          <div className="fixed top-0 right-0 h-full w-96 bg-background border-l shadow-lg z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Configuration</h2>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-accent rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="backend">Backend</Label>
                  <Select
                    value={localConfig.backend || 'embedded'}
                    onValueChange={(value) =>
                      handleInputChange('backend', value)
                    }
                  >
                    <SelectTrigger id="backend">
                      <SelectValue placeholder="Select backend" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="embedded">Embedded</SelectItem>
                      <SelectItem value="vercel">Vercel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isEmbedded && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="port">Port</Label>
                      <Input
                        id="port"
                        value={localConfig.port || ''}
                        onChange={(e) =>
                          handleInputChange('port', e.target.value)
                        }
                        placeholder="3001"
                        className={
                          getFieldError('port') ? 'border-destructive' : ''
                        }
                      />
                      {getFieldError('port') && (
                        <p className="text-sm text-destructive">
                          {getFieldError('port')}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dataDir">Data Directory</Label>
                      <Input
                        id="dataDir"
                        value={localConfig.dataDir || ''}
                        onChange={(e) =>
                          handleInputChange('dataDir', e.target.value)
                        }
                        placeholder=".workflow-data or .next/workflow-data"
                        className={
                          getFieldError('dataDir') ? 'border-destructive' : ''
                        }
                      />
                      {getFieldError('dataDir') && (
                        <p className="text-sm text-destructive">
                          {getFieldError('dataDir')}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Path to the workflow data directory. Can be relative or
                        absolute.
                      </p>
                    </div>
                  </>
                )}

                {!isEmbedded && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="env">Environment</Label>
                      <Input
                        id="env"
                        value={localConfig.env || 'production'}
                        onChange={(e) =>
                          handleInputChange('env', e.target.value)
                        }
                        placeholder="production or preview"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="authToken">Auth Token</Label>
                      <Input
                        id="authToken"
                        type="password"
                        value={localConfig.authToken || ''}
                        onChange={(e) =>
                          handleInputChange('authToken', e.target.value)
                        }
                        placeholder="Vercel auth token"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="project">Project ID</Label>
                      <Input
                        id="project"
                        value={localConfig.project || ''}
                        onChange={(e) =>
                          handleInputChange('project', e.target.value)
                        }
                        placeholder="prj_..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="team">Team ID</Label>
                      <Input
                        id="team"
                        value={localConfig.team || ''}
                        onChange={(e) =>
                          handleInputChange('team', e.target.value)
                        }
                        placeholder="team_..."
                      />
                    </div>
                  </>
                )}

                {errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Configuration Error</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1">
                        {errors.map((error, idx) => (
                          <li key={`error-${idx}`}>
                            {error.field !== 'general' && (
                              <strong>{error.field}:</strong>
                            )}{' '}
                            {error.message}
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-col gap-2 pt-4">
                  <Button
                    onClick={handleValidateAndApply}
                    disabled={isValidating || !hasChanges}
                    className="w-full"
                  >
                    {isValidating ? 'Validating...' : 'Apply Configuration'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setLocalConfig(config);
                      setErrors([]);
                      setIsOpen(false);
                    }}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
