type NavigateFn = (path: string) => void;

let navigateFn: NavigateFn | null = null;

export function setNavigate(fn: NavigateFn) {
    navigateFn = fn;
}

export function redirectToLogin() {
    navigateFn?.("/login");
}