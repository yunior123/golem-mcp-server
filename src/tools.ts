import { z } from "zod";
import type { GolemAPI } from "./api.js";

// ── Tool Definitions ──

export const TOOLS = [
  {
    name: "golem_list_workers",
    description:
      "List all workers (agent instances) for a component. Workers are the running instances of a Golem component.",
    inputSchema: {
      type: "object" as const,
      properties: {
        componentId: {
          type: "string",
          description: "The UUID of the component to list workers for",
        },
      },
      required: ["componentId"],
    },
  },
  {
    name: "golem_get_worker",
    description:
      "Get detailed information about a specific worker, including its status and metadata.",
    inputSchema: {
      type: "object" as const,
      properties: {
        componentId: {
          type: "string",
          description: "The UUID of the component",
        },
        workerName: {
          type: "string",
          description: "The name of the worker",
        },
      },
      required: ["componentId", "workerName"],
    },
  },
  {
    name: "golem_create_worker",
    description:
      "Create a new worker (agent instance) for a component.",
    inputSchema: {
      type: "object" as const,
      properties: {
        componentId: {
          type: "string",
          description: "The UUID of the component",
        },
        workerName: {
          type: "string",
          description: "The name for the new worker",
        },
      },
      required: ["componentId", "workerName"],
    },
  },
  {
    name: "golem_delete_worker",
    description: "Delete a worker (agent instance).",
    inputSchema: {
      type: "object" as const,
      properties: {
        componentId: {
          type: "string",
          description: "The UUID of the component",
        },
        workerName: {
          type: "string",
          description: "The name of the worker to delete",
        },
      },
      required: ["componentId", "workerName"],
    },
  },
  {
    name: "golem_invoke_worker",
    description:
      "Invoke a function on a Golem worker and wait for the result. Calls a WASM exported function on a running worker instance.",
    inputSchema: {
      type: "object" as const,
      properties: {
        componentId: {
          type: "string",
          description: "The UUID of the component",
        },
        workerName: {
          type: "string",
          description: "The name of the worker to invoke",
        },
        functionName: {
          type: "string",
          description: "The exported function name to call (e.g. 'golem:it/api.{add}')",
        },
        params: {
          type: "array",
          description: "Parameters to pass to the function (optional, defaults to [])",
        },
      },
      required: ["componentId", "workerName", "functionName"],
    },
  },
  {
    name: "golem_get_component",
    description:
      "Get detailed information about a Golem component, including its metadata and exports.",
    inputSchema: {
      type: "object" as const,
      properties: {
        componentId: {
          type: "string",
          description: "The UUID of the component",
        },
      },
      required: ["componentId"],
    },
  },
  {
    name: "golem_list_applications",
    description:
      "List all applications in a Golem account.",
    inputSchema: {
      type: "object" as const,
      properties: {
        accountId: {
          type: "string",
          description: "The UUID of the account",
        },
      },
      required: ["accountId"],
    },
  },
  {
    name: "golem_get_application",
    description:
      "Get detailed information about a specific Golem application.",
    inputSchema: {
      type: "object" as const,
      properties: {
        applicationId: {
          type: "string",
          description: "The UUID of the application",
        },
      },
      required: ["applicationId"],
    },
  },
  {
    name: "golem_list_environments",
    description:
      "List all visible environments. Environments are deployment targets within an application.",
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "golem_get_environment",
    description: "Get details about a specific environment.",
    inputSchema: {
      type: "object" as const,
      properties: {
        environmentId: {
          type: "string",
          description: "The UUID of the environment",
        },
      },
      required: ["environmentId"],
    },
  },
  {
    name: "golem_list_deployments",
    description:
      "List all deployments for an environment. Shows deployment history and current state.",
    inputSchema: {
      type: "object" as const,
      properties: {
        environmentId: {
          type: "string",
          description: "The UUID of the environment",
        },
      },
      required: ["environmentId"],
    },
  },
  {
    name: "golem_get_deployment",
    description: "Get a deployment summary including components and agent types.",
    inputSchema: {
      type: "object" as const,
      properties: {
        environmentId: {
          type: "string",
          description: "The UUID of the environment",
        },
        deploymentId: {
          type: "string",
          description: "The deployment ID or revision number",
        },
      },
      required: ["environmentId", "deploymentId"],
    },
  },
  {
    name: "golem_list_components",
    description:
      "List all components in an environment. Components are compiled WASM modules.",
    inputSchema: {
      type: "object" as const,
      properties: {
        environmentId: {
          type: "string",
          description: "The UUID of the environment",
        },
      },
      required: ["environmentId"],
    },
  },
  {
    name: "golem_get_worker_oplog",
    description:
      "Get the operation log (execution history) for a worker. Useful for debugging and understanding worker behavior.",
    inputSchema: {
      type: "object" as const,
      properties: {
        componentId: {
          type: "string",
          description: "The UUID of the component",
        },
        workerName: {
          type: "string",
          description: "The name of the worker",
        },
      },
      required: ["componentId", "workerName"],
    },
  },
  {
    name: "golem_interrupt_worker",
    description: "Interrupt (pause) a running worker.",
    inputSchema: {
      type: "object" as const,
      properties: {
        componentId: {
          type: "string",
          description: "The UUID of the component",
        },
        workerName: {
          type: "string",
          description: "The name of the worker to interrupt",
        },
      },
      required: ["componentId", "workerName"],
    },
  },
  {
    name: "golem_resume_worker",
    description: "Resume a previously interrupted worker.",
    inputSchema: {
      type: "object" as const,
      properties: {
        componentId: {
          type: "string",
          description: "The UUID of the component",
        },
        workerName: {
          type: "string",
          description: "The name of the worker to resume",
        },
      },
      required: ["componentId", "workerName"],
    },
  },
] as const;

// ── Zod Schemas for Input Validation ──

const UUIDSchema = z.string().uuid();
const WorkerNameSchema = z.string().min(1);

const schemas = {
  golem_list_workers: z.object({ componentId: UUIDSchema }),
  golem_get_worker: z.object({ componentId: UUIDSchema, workerName: WorkerNameSchema }),
  golem_create_worker: z.object({ componentId: UUIDSchema, workerName: WorkerNameSchema }),
  golem_delete_worker: z.object({ componentId: UUIDSchema, workerName: WorkerNameSchema }),
  golem_invoke_worker: z.object({
    componentId: UUIDSchema,
    workerName: WorkerNameSchema,
    functionName: z.string().min(1),
    params: z.array(z.unknown()).optional(),
  }),
  golem_get_component: z.object({ componentId: UUIDSchema }),
  golem_list_applications: z.object({ accountId: UUIDSchema }),
  golem_get_application: z.object({ applicationId: UUIDSchema }),
  golem_get_worker_oplog: z.object({ componentId: UUIDSchema, workerName: WorkerNameSchema }),
  golem_interrupt_worker: z.object({ componentId: UUIDSchema, workerName: WorkerNameSchema }),
  golem_resume_worker: z.object({ componentId: UUIDSchema, workerName: WorkerNameSchema }),
  golem_list_environments: z.object({}),
  golem_get_environment: z.object({ environmentId: UUIDSchema }),
  golem_list_deployments: z.object({ environmentId: UUIDSchema }),
  golem_get_deployment: z.object({ environmentId: UUIDSchema, deploymentId: z.string().min(1) }),
  golem_list_components: z.object({ environmentId: UUIDSchema }),
} as const;

// ── Tool Call Handler ──

export async function handleToolCall(
  api: GolemAPI,
  name: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const text = async (fn: () => Promise<unknown>) => {
    const result = await fn();
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  };

  switch (name) {
    case "golem_list_workers": {
      const p = schemas.golem_list_workers.parse(args);
      return text(() => api.listWorkers(p.componentId));
    }
    case "golem_get_worker": {
      const p = schemas.golem_get_worker.parse(args);
      return text(() => api.getWorker(p.componentId, p.workerName));
    }
    case "golem_create_worker": {
      const p = schemas.golem_create_worker.parse(args);
      return text(() => api.createWorker(p.componentId, p.workerName));
    }
    case "golem_delete_worker": {
      const p = schemas.golem_delete_worker.parse(args);
      return text(() => api.deleteWorker(p.componentId, p.workerName));
    }
    case "golem_invoke_worker": {
      const p = schemas.golem_invoke_worker.parse(args);
      return text(() => api.invokeWorker(p.componentId, p.workerName, p.functionName, p.params));
    }
    case "golem_get_component": {
      const p = schemas.golem_get_component.parse(args);
      return text(() => api.getComponent(p.componentId));
    }
    case "golem_list_applications": {
      const p = schemas.golem_list_applications.parse(args);
      return text(() => api.listApplications(p.accountId));
    }
    case "golem_get_application": {
      const p = schemas.golem_get_application.parse(args);
      return text(() => api.getApplication(p.applicationId));
    }
    case "golem_get_worker_oplog": {
      const p = schemas.golem_get_worker_oplog.parse(args);
      return text(() => api.getWorkerOplog(p.componentId, p.workerName));
    }
    case "golem_interrupt_worker": {
      const p = schemas.golem_interrupt_worker.parse(args);
      return text(() => api.interruptWorker(p.componentId, p.workerName));
    }
    case "golem_resume_worker": {
      const p = schemas.golem_resume_worker.parse(args);
      return text(() => api.resumeWorker(p.componentId, p.workerName));
    }
    case "golem_list_environments": {
      schemas.golem_list_environments.parse(args);
      return text(() => api.listEnvironments());
    }
    case "golem_get_environment": {
      const p = schemas.golem_get_environment.parse(args);
      return text(() => api.getEnvironment(p.environmentId));
    }
    case "golem_list_deployments": {
      const p = schemas.golem_list_deployments.parse(args);
      return text(() => api.listDeployments(p.environmentId));
    }
    case "golem_get_deployment": {
      const p = schemas.golem_get_deployment.parse(args);
      return text(() => api.getDeploymentSummary(p.environmentId, p.deploymentId));
    }
    case "golem_list_components": {
      const p = schemas.golem_list_components.parse(args);
      return text(() => api.listEnvironmentComponents(p.environmentId));
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
