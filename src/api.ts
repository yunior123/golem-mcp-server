import type { Config } from "./config.js";

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

    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Golem API ${method} ${path} returned ${res.status}: ${text}`);
    }

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return (await res.json()) as T;
    }
    return (await res.text()) as unknown as T;
  }

  // ── Applications ──

  async listApplications(accountId: string): Promise<unknown> {
    return this.request("GET", `/v1/accounts/${accountId}/apps`);
  }

  async getApplication(applicationId: string): Promise<unknown> {
    return this.request("GET", `/v1/apps/${applicationId}`);
  }

  // ── Components ──

  async getComponent(componentId: string): Promise<unknown> {
    return this.request("GET", `/v1/components/${componentId}`);
  }

  async listEnvironmentComponents(environmentId: string): Promise<unknown> {
    return this.request("GET", `/v1/envs/${environmentId}/components`);
  }

  // ── Workers (Agents) ──

  async listWorkers(componentId: string): Promise<unknown> {
    return this.request("GET", `/v1/components/${componentId}/workers`);
  }

  async getWorker(componentId: string, workerName: string): Promise<unknown> {
    return this.request(
      "GET",
      `/v1/components/${componentId}/workers/${encodeURIComponent(workerName)}`
    );
  }

  async createWorker(
    componentId: string,
    workerName: string
  ): Promise<unknown> {
    return this.request("POST", `/v1/components/${componentId}/workers`, {
      name: workerName,
    });
  }

  async deleteWorker(
    componentId: string,
    workerName: string
  ): Promise<unknown> {
    return this.request(
      "DELETE",
      `/v1/components/${componentId}/workers/${encodeURIComponent(workerName)}`
    );
  }

  async interruptWorker(
    componentId: string,
    workerName: string
  ): Promise<unknown> {
    return this.request(
      "POST",
      `/v1/components/${componentId}/workers/${encodeURIComponent(workerName)}/interrupt`
    );
  }

  async resumeWorker(
    componentId: string,
    workerName: string
  ): Promise<unknown> {
    return this.request(
      "POST",
      `/v1/components/${componentId}/workers/${encodeURIComponent(workerName)}/resume`
    );
  }

  // ── Agent Invocation ──

  async invokeAgent(params: {
    appName: string;
    envName?: string;
    agentTypeName: string;
    parameters?: unknown;
    methodName?: string;
    methodParameters?: unknown;
  }): Promise<unknown> {
    return this.request("POST", "/v1/agents/invoke-agent", params);
  }

  // ── Worker Logs (oplog) ──

  async getWorkerOplog(
    componentId: string,
    workerName: string
  ): Promise<unknown> {
    return this.request(
      "GET",
      `/v1/components/${componentId}/workers/${encodeURIComponent(workerName)}/oplog`
    );
  }
}
