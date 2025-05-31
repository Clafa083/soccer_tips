export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 6) {
        errors.push('Lösenordet måste vara minst 6 tecken långt');
    }
    
    if (!/[A-Z]/.test(password)) {
        errors.push('Lösenordet måste innehålla minst en stor bokstav');
    }
    
    if (!/[0-9]/.test(password)) {
        errors.push('Lösenordet måste innehålla minst en siffra');
    }
    
    return errors;
};

export const validateName = (name: string): boolean => {
    return name.length >= 2 && /^[a-zA-ZåäöÅÄÖ\s-]+$/.test(name);
};

export const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'Ett okänt fel har inträffat';
};
