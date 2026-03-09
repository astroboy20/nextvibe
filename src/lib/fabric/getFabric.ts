let fabricLib: any | null = null;

export const getFabric = async () => {
    if (!fabricLib) {
        fabricLib = await import("fabric");
    }
    return fabricLib;
};