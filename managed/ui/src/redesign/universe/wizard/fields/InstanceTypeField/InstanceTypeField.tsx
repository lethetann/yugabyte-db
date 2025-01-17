import _ from 'lodash';
import React, { FC, useContext } from 'react';
import { useQuery } from 'react-query';
import { Controller, useFormContext } from 'react-hook-form';
import { GroupType } from 'react-select';
import pluralize from 'pluralize';
import { Select } from '../../../../uikit/Select/Select';
import { ErrorMessage } from '../../../../uikit/ErrorMessage/ErrorMessage';
import { api, QUERY_KEY } from '../../../../helpers/api';
import { CloudType, InstanceType } from '../../../../helpers/dtos';
import { InstanceConfigFormValue } from '../../steps/instance/InstanceConfig';
import { WizardContext } from '../../UniverseWizard';
import { translate } from '../../../../uikit/I18n/I18n';
import './InstanceTypeField.scss';

export const AZURE_INSTANCE_TYPE_GROUPS = {
  'B-Series': /^standard_b.+/i,
  'D-Series': /^standard_d.+/i,
  'E-Series': /^standard_e.+/i,
  'F-Series': /^standard_f.+/i,
  'GS-Series': /^standard_gs.+/i,
  'H-Series': /^standard_h.+/i,
  'L-Series': /^standard_l.+/i,
  'M-Series': /^standard_m.+/i,
  'N-Series': /^standard_n.+/i,
  'P-Series': /^standard_p.+/i
};

const getOptionLabel = (option: InstanceType): string => {
  let result = option.instanceTypeCode;
  if (option.numCores && option.memSizeGB) {
    const cores = pluralize('core', option.numCores, true);
    result = `${option.instanceTypeCode} (${cores}, ${option.memSizeGB}GB RAM)`;
  }
  return result;
};
const getOptionValue = (option: InstanceType): string => option.instanceTypeCode;
const formatGroupLabel = (group: GroupType<InstanceType>): string => group.label;

const sortAndGroup = (data?: InstanceType[], cloud?: CloudType): GroupType<InstanceType>[] => {
  if (!data) return [];

  const getGroupName = (instanceTypeCode: string): string => {
    switch (cloud) {
      case CloudType.aws:
        return instanceTypeCode.split('.')[0]; // c5.large --> c5
      case CloudType.gcp:
        return instanceTypeCode.split('-')[0]; // n1-standard-1 --> n1
      case CloudType.azu:
        for (const [groupName, regexp] of Object.entries(AZURE_INSTANCE_TYPE_GROUPS)) {
          if (regexp.test(instanceTypeCode)) return groupName;
        }
        return translate('Other');
      default:
        return '';
    }
  };

  // to sort in a human-friendly order: ['a10', 'a2', 'a12', 'a1'] --> ['a1', 'a2', 'a10', 'a12']
  const comparator = (a: InstanceType, b: InstanceType): number => {
    const options = { numeric: true, sensitivity: 'base' };
    return a.instanceTypeCode.localeCompare(b.instanceTypeCode, 'en', options);
  };

  const result: GroupType<InstanceType>[] = [];
  const groups: Record<string, InstanceType[]> = {};

  // breakdown instance types by categories
  data.forEach((item) => {
    const groupName = getGroupName(item.instanceTypeCode);
    if (Array.isArray(groups[groupName])) {
      groups[groupName].push(item);
    } else {
      groups[groupName] = [item];
    }
  });

  // convert categories map to dropdown list format and sort group items
  for (const [groupName, list] of Object.entries(groups)) {
    list.sort(comparator);
    result.push({ label: groupName, options: list });
  }

  // sort by group names and return final result
  return _.sortBy(result, 'label');
};

const DEFAULT_INSTANCE_TYPES = {
  [CloudType.aws]: 'c5.large',
  [CloudType.gcp]: 'n1-standard-1',
  [CloudType.kubernetes]: 'small'
};

const ERROR_NO_INSTANCE_TYPE = 'Instance Type value is required';
const FIELD_NAME = 'instanceType';

export const InstanceTypeField: FC = () => {
  const {
    control,
    formState: { errors },
    getValues,
    setValue
  } = useFormContext<InstanceConfigFormValue>();
  const { formData } = useContext(WizardContext);
  const { data } = useQuery(
    [QUERY_KEY.getInstanceTypes, formData.cloudConfig.provider?.uuid],
    () => api.fetchInstanceTypes(formData.cloudConfig.provider?.uuid),
    {
      enabled: !!formData.cloudConfig.provider?.uuid,
      onSuccess: (data) => {
        // preselect default instance or pick first item from the instance types list
        if (!getValues(FIELD_NAME) && formData.cloudConfig.provider?.code && data.length) {
          const defaultInstanceType =
            DEFAULT_INSTANCE_TYPES[formData.cloudConfig.provider.code] || data[0].instanceTypeCode;
          setValue(FIELD_NAME, defaultInstanceType); // intentionally omit validation as field wasn't changed by user
        }
      }
    }
  );
  const instanceTypes = sortAndGroup(data, formData.cloudConfig.provider?.code);

  return (
    <div className="instance-type-field">
      <Controller
        control={control}
        name={FIELD_NAME}
        rules={{ required: ERROR_NO_INSTANCE_TYPE }}
        render={({ field }) => (
          <Select<InstanceType>
            isSearchable
            isClearable={false}
            className={errors[FIELD_NAME]?.message ? 'validation-error' : ''}
            getOptionLabel={getOptionLabel}
            getOptionValue={getOptionValue}
            value={
              instanceTypes
                .flatMap((item) => item.options)
                .find((item) => item.instanceTypeCode === field.value) || null
            }
            onBlur={field.onBlur}
            onChange={(item) => {
              field.onChange((item as InstanceType).instanceTypeCode);
            }}
            options={instanceTypes}
            formatGroupLabel={formatGroupLabel}
          />
        )}
      />
      <ErrorMessage message={errors[FIELD_NAME]?.message} />
    </div>
  );
};
