import type { GolemAPI } from "./api.js";

// ── Resource Templates ──
// Resources use URI templates for dynamic data.

export const RESOURCE_TEMPLATES = [
  {
    uriTemplate: "golem://applications/{accountId}",
    name: "Applications",
    description: "List of all Golem applications in an account",
    mimeType: "application/json",
  },
  {
    uriTemplate: "golem://applications/{applicationId}/details",
    name: "Application Details",
    description: "Detailed information about a specific application",
    mimeType: "application/json",
  },
  {
    uriTemplate: "golem://components/{componentId}",
    name: "Component",
    description: "Detailed information about a Golem component",
    mimeType: "application/json",
  },
  {
    uriTemplate: "golem://components/{componentId}/workers",
    name: "Workers",
    description: "List of workers (agent instances) for a component",
    mimeType: "application/json",
  },
  {
    uriTemplate: "golem://components/{componentId}/workers/{workerName}",
    name: "Worker Details",
    description: "Detailed information about a specific worker",
    mimeType: "application/json",
  },
  {
    uriTemplate: "golem://components/{componentId}/workers/{workerName}/oplog",
    name: "Worker Operation Log",
    description: "Execution history and logs for a worker",
    mimeType: "application/json",
  },
  {
    uriTemplate: "golem://environments",
    name: "Environments",
    description: "List of all visible environments",
    mimeType: "application/json",
  },
  {
    uriTemplate: "golem://environments/{environmentId}",
    name: "Environment Details",
    description: "Detailed information about a specific environment",
    mimeType: "application/json",
  },
  {
    uriTemplate: "golem://environments/{environmentId}/deployments",
    name: "Deployments",
    description: "Deployment history for an environment",
    mimeType: "application/json",
  },
];

// ── Resource Read Handler ──

export async function handleResourceRead(
  api: GolemAPI,
  uri: string
): Promise<{
  contents: Array<{ uri: string; mimeType: string; text: string }>;
}> {
  const url = new URL(uri);
  const path = url.hostname + url.pathname;

  // golem://applications/{accountId}
  let match = path.match(/^applications\/([^/]+)$/);
  if (match) {
    const data = await api.listApplications(match[1]);
    return wrap(uri, data);
  }

  // golem://applications/{applicationId}/details
  match = path.match(/^applications\/([^/]+)\/details$/);
  if (match) {
    const data = await api.getApplication(match[1]);
    return wrap(uri, data);
  }

  // golem://components/{componentId}/workers/{workerName}/oplog
  match = path.match(/^components\/([^/]+)\/workers\/([^/]+)\/oplog$/);
  if (match) {
    const data = await api.getWorkerOplog(match[1], match[2]);
    return wrap(uri, data);
  }

  // golem://components/{componentId}/workers/{workerName}
  match = path.match(/^components\/([^/]+)\/workers\/([^/]+)$/);
  if (match) {
    const data = await api.getWorker(match[1], match[2]);
    return wrap(uri, data);
  }

  // golem://components/{componentId}/workers
  match = path.match(/^components\/([^/]+)\/workers$/);
  if (match) {
    const data = await api.listWorkers(match[1]);
    return wrap(uri, data);
  }

  // golem://components/{componentId}
  match = path.match(/^components\/([^/]+)$/);
  if (match) {
    const data = await api.getComponent(match[1]);
    return wrap(uri, data);
  }

  // golem://environments
  if (path === "environments") {
    const data = await api.listEnvironments();
    return wrap(uri, data);
  }

  // golem://environments/{environmentId}/deployments
  match = path.match(/^environments\/([^/]+)\/deployments$/);
  if (match) {
    const data = await api.listDeployments(match[1]);
    return wrap(uri, data);
  }

  // golem://environments/{environmentId}
  match = path.match(/^environments\/([^/]+)$/);
  if (match) {
    const data = await api.getEnvironment(match[1]);
    return wrap(uri, data);
  }

  throw new Error(`Unknown resource URI: ${uri}`);
}

function wrap(
  uri: string,
  data: unknown
): { contents: Array<{ uri: string; mimeType: string; text: string }> } {
  return {
    contents: [
      {
        uri,
        mimeType: "application/json",
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}
