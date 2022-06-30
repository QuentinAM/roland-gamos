import { GetToken } from './utils';

export async function get() {
    return {
        status: 200,
        body: {
            token: await GetToken()
        }
    };
}