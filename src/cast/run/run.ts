import { exec } from "child_process";
import { promisify } from "util";

// Type definition for logging function
type LoggingFunction = (message: { level: string, data: any }) => void;

const execAsync = promisify(exec);

export async function runTransaction(logger: LoggingFunction, transactionHash: string, rpcUrl: string, quick: boolean): Promise<string> {
    // Use subprocess to perform the cast run command
    const quickFlag = quick ? "--quick" : "";
    const command = `cast run ${transactionHash} --rpc-url ${rpcUrl} ${quickFlag}`;
    logger({ level: "info", data: { message: `Running command: ${command}` } });

    const { stdout } = await execAsync(command);
    if (!stdout) {
        return "No result from cast run";
    }
    return stdout;
}
