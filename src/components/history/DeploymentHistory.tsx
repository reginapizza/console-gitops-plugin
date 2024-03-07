import * as React from 'react';
import { useTranslation } from 'react-i18next';
import * as _ from 'lodash';

import {
  ListPageFilter,
  RowFilter,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { LoadingBox } from '@patternfly/quickstarts';

import { fetchDataFrequency, historyBaseURI } from '../../const';
import EnvironmentEmptyState from '../EnvironmentEmptyState';
import { GitOpsHistoryData } from '../utils/gitops-types';
import { getEnvData } from '../utils/gitops-utils';

import { DeploymentHistoryColumns } from './DeploymentHistoryColumns';
import { DeploymentHistoryTableRow } from './DeploymentHistoryTableRow';

import './DeploymentHistory.scss';

type GitOpsDeploymentHistoryProps = {
  customData: {
    emptyStateMsg: string;
    envs: string[];
    applicationBaseURI: string;
    location?: Location;
  };
};
const GitOpsDeploymentHistory: React.FC<GitOpsDeploymentHistoryProps> = ({
  customData: { emptyStateMsg, envs, applicationBaseURI },
}) => {
  const { t } = useTranslation('plugin__gitops-plugin');
  // const location = useLocation();
  const columns = DeploymentHistoryColumns();
  const envRowFilters: RowFilter[] = [
    {
      filterGroupName: t('plugin__gitops-plugin~Environment'),
      type: 'environment',
      reducer: (s: GitOpsHistoryData): string => s?.environment,
      filter: (input, history) =>
        history.environment.includes(input.selected) ||
        input.selected.includes(history.environment),
      items: _.map(envs, (env) => ({ id: env, title: env })),
    },
  ];

  const [historyData, setHistoryData] = React.useState<GitOpsHistoryData[]>(null);
  const [error, setError] = React.useState<string>(null);
  React.useEffect(() => {
    let ignore = false;
    const getHistory = async () => {
      if (!_.isEmpty(envs)) {
        let arrayHistory;
        try {
          arrayHistory = await Promise.all(
            _.map(envs, (env) =>
              getEnvData(historyBaseURI, historyBaseURI, env, applicationBaseURI),
            ),
          );
          arrayHistory = arrayHistory?.flat(1);
        } catch (err) {
          if (err instanceof Error) {
            if (err.name === 'HttpError' && err.message === 'Not Found') {
              setError(
                t(
                  'plugin__gitops-plugin~The history cannot be obtained due to an HTTP Not Found Error. This could mean that the GitOps Operator needs to be upgraded to the latest version or the GitOps cluster pod is not running.',
                ),
              );
            } else {
              setError(
                t(
                  'plugin__gitops-plugin~The history cannot be obtained due to an error. Check the GitOps cluster pod log for any errors.',
                ),
              );
            }
          }
        }
        if (ignore) return;
        setHistoryData(arrayHistory);
      }
    };
    getHistory();
    const id = setInterval(getHistory, fetchDataFrequency * 1000);

    return () => {
      ignore = true;
      clearInterval(id);
    };
  }, [applicationBaseURI, envs, t]);

  const [data, filteredData, onFilterChange] = useListPageFilter(historyData, envRowFilters);

  const getReturnComponent = () => {
    if (!historyData && !error) {
      return <LoadingBox />;
    } else if (error) {
      return <EnvironmentEmptyState emptyStateMsg={error} />;
    } else if (emptyStateMsg) {
      return (
        <EnvironmentEmptyState
          emptyStateMsg={emptyStateMsg || t('plugin__gitops-plugin~No history')}
        />
      );
    } else {
      return (
        <>
          <ListPageFilter
            data={data}
            loaded={!emptyStateMsg}
            rowFilters={envRowFilters}
            onFilterChange={onFilterChange}
            hideNameLabelFilters
          />
          <VirtualizedTable
            data={filteredData}
            unfilteredData={historyData}
            loaded={!emptyStateMsg}
            columns={columns}
            Row={DeploymentHistoryTableRow}
            loadError={null}
          />
        </>
      );
    }
  };

  return <div className="gitops-plugin__deployment-history-list">{getReturnComponent()}</div>;
};

export default GitOpsDeploymentHistory;
