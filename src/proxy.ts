import { NextResponse, NextRequest } from 'next/server';
import { experiments, assignVariant } from './lib/experiments';

const USER_COOKIE = 'ab_uid';
const ONE_YEAR = 60 * 60 * 24 * 365;

export function proxy(request: NextRequest) {
    let userId = request.cookies.get(USER_COOKIE)?.value;
    if(!userId) userId = crypto.randomUUID();

    const requestHeaders = new Headers(request.headers);
    const cookiesToSet: Array<{ name: string; value: string }> = [];

    for (const experiment of Object.values(experiments)) {
        const EXPERIMENT_COOKIE_NAME = `ab_${experiment.id}`;
        const EXPERIMENT_COOKIE = request.cookies.get(EXPERIMENT_COOKIE_NAME);
        const isValidCookie = experiment.variants.some(v => v.id === EXPERIMENT_COOKIE?.value);
                    
       const variant = isValidCookie 
        ? experiment.variants.find(v => v.id === EXPERIMENT_COOKIE?.value) 
        : assignVariant(userId, experiment);

        requestHeaders.set(`x-ab-${experiment.id}`, variant?.id || '');
        cookiesToSet.push({
            name: EXPERIMENT_COOKIE_NAME,
            value: variant?.id || ''
        })
    }
    requestHeaders.set('x-ab-uid', userId);

    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.cookies.set(USER_COOKIE, userId, { maxAge: ONE_YEAR, path: '/' })
    cookiesToSet.forEach(cookie => {
        response.cookies.set(cookie.name, cookie.value, { maxAge: ONE_YEAR, path: '/' })
    })
    return response;
}

export const config = {
    matcher: '/',
}