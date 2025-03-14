export function calculateStatistics(servers, queue, totalCustomers, servedCustomers) {
    const busyServers = servers.filter(status => status).length;
    return {
        queueLength: queue.length,
        serverUtilization: busyServers / servers.length,
        serviceRate: totalCustomers > 0 ? servedCustomers / totalCustomers : 0
    };
}