import type { Config } from "./config.js";

/** Encode a path segment for safe URL construction. */
const e = encodeURIComponent;

export class GolemAPI {
  private baseUrl: string;
  private token: string;

  constructor(config: Config) {
    this.baseUrl = config.apiUrl.replace(/\/$/, "");
    this.token = config.apiToken;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.token}`,
      Accept: "application/json",
    };
    if (body) {
      headers["Content-Type"] = "application/json; charset=utf-8";
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    let res: Response;
    try {
      res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) {
      const text = await res.text();
      // Truncate backend error to avoid leaking internal details to LLM client
      const sanitized = text.length > 200 ? text.slice(0, 200) + "..." : text;
      throw new Error(`Golem API ${method} ${path} returned ${res.status}: ${sanitized}`);
    }

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return (await res.json()) as T;
    }
    // Handle 204 No Content and other non-JSON success responses
    const text = await res.text();
    return (text || null) as unknown as T;
  }

  // ── Applications ──

  async listApplications(accountId: string): Promise<unknown> {
    return this.request("GET", `/v1/accounts/${e(accountId)}/apps`);
  }

  async getApplication(applicationId: string): Promise<unknown> {
    return this.request("GET", `/v1/apps/${e(applicationId)}`);
  }

  // ── Components ──

  async getComponent(componentId: string): Promise<unknown> {
    return this.request("GET", `/v1/components/${e(componentId)}`);
  }

  async listEnvironmentComponents(environmentId: string): Promise<unknown> {
    return this.request("GET", `/v1/envs/${e(environmentId)}/components`);
  }

  // ── Workers ──

  async listWorkers(componentId: string): Promise<unknown> {
    return this.request("GET", `/v1/components/${e(componentId)}/workers`);
  }

  async getWorker(componentId: string, workerName: string): Promise<unknown> {
    return this.request(
      "GET",
      `/v1/components/${e(componentId)}/workers/${e(workerName)}`
    );
  }

  async createWorker(
    componentId: string,
    workerName: string
  ): Promise<unknown> {
    return this.request("POST", `/v1/components/${e(componentId)}/workers`, {
      name: workerName,
    });
  }

  async deleteWorker(
    componentId: string,
    workerName: string
  ): Promise<unknown> {
    return this.request(
      "DELETE",
      `/v1/components/${e(componentId)}/workers/${e(workerName)}`
    );
  }

  async interruptWorker(
    componentId: string,
    workerName: string
  ): Promise<unknown> {
    return this.request(
      "POST",
      `/v1/components/${e(componentId)}/workers/${e(workerName)}/interrupt`
    );
  }

  async resumeWorker(
    componentId: string,
    workerName: string
  ): Promise<unknown> {
    return this.request(
      "POST",
      `/v1/components/${e(componentId)}/workers/${e(workerName)}/resume`
    );
  }

  // ── Agent Invocation ──

  async invokeWorker(
    componentId: string,
    workerName: string,
    functionName: string,
    params?: unknown
  ): Promise<unknown> {
    return this.request(
      "POST",
      `/v1/components/${e(componentId)}/workers/${e(workerName)}/invoke-and-await`,
      { function: functionName, params: params ?? [] }
    );
  }

  // ── Environments ──

  async listEnvironments(): Promise<unknown> {
    return this.request("GET", "/v1/envs");
  }

  async getEnvironment(environmentId: string): Promise<unknown> {
    return this.request("GET", `/v1/envs/${e(environmentId)}`);
  }

  async listApplicationEnvironments(applicationId: string): Promise<unknown> {
    return this.request("GET", `/v1/apps/${e(applicationId)}/envs`);
  }

  // ── Deployments ──

  async listDeployments(environmentId: string): Promise<unknown> {
    return this.request("GET", `/v1/envs/${e(environmentId)}/deployments`);
  }

  async getDeploymentSummary(
    environmentId: string,
    deploymentId: string
  ): Promise<unknown> {
    return this.request(
      "GET",
      `/v1/envs/${e(environmentId)}/deployments/${e(deploymentId)}/summary`
    );
  }

  async listDeploymentAgentTypes(
    environmentId: string,
    deploymentId: string
  ): Promise<unknown> {
    return this.request(
      "GET",
      `/v1/envs/${e(environmentId)}/deployments/${e(deploymentId)}/agent-types`
    );
  }

  // ── Worker Logs (oplog) ──

  async getWorkerOplog(
    componentId: string,
    workerName: string
  ): Promise<unknown> {
    return this.request(
      "GET",
      `/v1/components/${e(componentId)}/workers/${e(workerName)}/oplog`
    );
  }
}
