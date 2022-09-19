import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { ResourceIcon } from '@openshift-console/dynamic-plugin-sdk';
import { Card, CardBody, Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';

import { GitOpsEnvironmentService, GitOpsHealthResources } from '../utils/gitops-types';

import ResourceRow from './ResourceRow';

import './ResourcesSection.scss';

interface GitOpsResourcesSectionProps {
  services: GitOpsEnvironmentService[];
  secrets: GitOpsHealthResources[];
  deployments: GitOpsHealthResources[];
  routes: GitOpsHealthResources[];
  roleBindings: GitOpsHealthResources[];
  clusterRoles: GitOpsHealthResources[];
  clusterRoleBindings: GitOpsHealthResources[];
}

export enum HealthStatus {
  DEGRADED = 'Degraded',
  PROGRESSING = 'Progressing',
  MISSING = 'Missing',
  UNKNOWN = 'Unknown',
}

const getUnhealthyResources =
  () =>
  (acc: string[], current: GitOpsHealthResources): string[] =>
    current.health === HealthStatus.DEGRADED ||
    current.health === HealthStatus.PROGRESSING ||
    current.health === HealthStatus.MISSING ||
    current.health === HealthStatus.UNKNOWN
      ? [...acc, current.health]
      : acc;

const getNonSyncedResources =
  () =>
  (acc: string[], current: GitOpsHealthResources): string[] =>
    current.status !== 'Synced' ? [...acc, current.status] : acc;

const GitOpsResourcesSection: React.FC<GitOpsResourcesSectionProps> = ({
  services,
  secrets,
  deployments,
  routes,
  roleBindings,
  clusterRoles,
  clusterRoleBindings,
}) => {
  const { t } = useTranslation();
  const degradedServices: string[] = services ? services.reduce(getUnhealthyResources(), []) : [];
  const degradedDeployments: string[] = deployments
    ? deployments.reduce(getUnhealthyResources(), [])
    : [];
  const degradedSecrets: string[] = secrets ? secrets.reduce(getUnhealthyResources(), []) : [];
  const degradedRoutes: string[] = routes ? routes.reduce(getUnhealthyResources(), []) : [];

  const nonSyncedSyncServices: string[] = services
    ? services.reduce(getNonSyncedResources(), [])
    : [];
  const nonSyncedDeployments: string[] = deployments
    ? deployments.reduce(getNonSyncedResources(), [])
    : [];
  const nonSyncedSecrets: string[] = secrets ? secrets.reduce(getNonSyncedResources(), []) : [];
  const nonSyncedRoutes: string[] = routes ? routes.reduce(getNonSyncedResources(), []) : [];
  const nonSyncedRoleBindings: string[] = roleBindings
    ? roleBindings.reduce(getNonSyncedResources(), [])
    : [];
  const nonSyncedClusterRoles: string[] = clusterRoles
    ? clusterRoles.reduce(getNonSyncedResources(), [])
    : [];
  const nonSyncedClusterRoleBindings: string[] = clusterRoleBindings
    ? clusterRoleBindings.reduce(getNonSyncedResources(), [])
    : [];

  return (
    <>
      <StackItem className="gitops-plugin__resources">
        <Card>
          <h3 className="gitops-plugin__resources__title co-nowrap">
            {t('gitops-plugin~Resources')}
          </h3>
          <CardBody>
            <Split hasGutter>
              <span className="gitops-plugin__resources__list">
                <SplitItem>
                  <Stack style={{ marginRight: 'var(--pf-global--spacer--sm)' }}>
                    <StackItem>{deployments ? deployments.length : 'N/A'}</StackItem>
                    <StackItem>{secrets ? secrets.length : 'N/A'}</StackItem>
                    <StackItem>{services ? services.length : 'N/A'}</StackItem>
                    <StackItem>{routes ? routes.length : 'N/A'}</StackItem>
                    <StackItem>{roleBindings ? roleBindings.length : 'N/A'}</StackItem>
                    <StackItem>{clusterRoles ? clusterRoles.length : 'N/A'}</StackItem>
                    <StackItem>
                      {clusterRoleBindings ? clusterRoleBindings.length : 'N/A'}
                    </StackItem>
                  </Stack>
                </SplitItem>
                <SplitItem>
                  <Stack style={{ marginRight: 'var(--pf-global--spacer--sm)' }}>
                    <StackItem>
                      <ResourceIcon kind={'Deployments'} /> {t('gitops-plugin~Deployments')}
                    </StackItem>
                    <StackItem>
                      <ResourceIcon kind="Secret" /> {t('gitops-plugin~Secrets')}
                    </StackItem>
                    <StackItem>
                      <ResourceIcon kind="Service" /> {t('gitops-plugin~Services')}
                    </StackItem>
                    <StackItem>
                      <ResourceIcon kind="Route" /> {t('gitops-plugin~Routes')}
                    </StackItem>
                    <StackItem>
                      <ResourceIcon kind="RoleBinding" /> {t('gitops-plugin~Role Bindings')}
                    </StackItem>
                    <StackItem>
                      <ResourceIcon kind="ClusterRole" /> {t('gitops-plugin~Cluster Roles')}
                    </StackItem>
                    <StackItem>
                      <ResourceIcon kind="ClusterRoleBinding" />{' '}
                      {t('gitops-plugin~Cluster Role Bindings')}
                    </StackItem>
                  </Stack>
                </SplitItem>
              </span>
              <SplitItem>
                <Stack style={{ alignItems: 'flex-end' }}>
                  <ResourceRow
                    resources={deployments}
                    degradedResources={degradedDeployments}
                    nonSyncedResources={nonSyncedDeployments}
                  />
                  <ResourceRow
                    resources={secrets}
                    degradedResources={degradedSecrets}
                    nonSyncedResources={nonSyncedSecrets}
                  />
                  <ResourceRow
                    resources={services}
                    degradedResources={degradedServices}
                    nonSyncedResources={nonSyncedSyncServices}
                  />
                  <ResourceRow
                    resources={routes}
                    degradedResources={degradedRoutes}
                    nonSyncedResources={nonSyncedRoutes}
                  />
                  <ResourceRow
                    resources={roleBindings}
                    degradedResources={null}
                    nonSyncedResources={nonSyncedRoleBindings}
                  />
                  <ResourceRow
                    resources={clusterRoles}
                    degradedResources={null}
                    nonSyncedResources={nonSyncedClusterRoles}
                  />
                  <ResourceRow
                    resources={clusterRoleBindings}
                    degradedResources={null}
                    nonSyncedResources={nonSyncedClusterRoleBindings}
                  />
                </Stack>
              </SplitItem>
            </Split>
          </CardBody>
        </Card>
      </StackItem>
    </>
  );
};

export default GitOpsResourcesSection;