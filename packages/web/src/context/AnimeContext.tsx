import React, { createContext, ReactNode } from 'react';

// This context is currently not used for state management as react-query handles data fetching.
// This file exists to resolve an import issue. A dummy provider is created to avoid breaking the app.

// 1. Create a context
// We are providing a default empty object as the app logic does not depend on this context.
const AnimeContext = createContext({});

// 2. Create a provider component
interface AnimeProviderProps {
    children: ReactNode;
}

export const AnimeProvider: React.FC<AnimeProviderProps> = ({ children }) => {
    // Since react-query is managing the anime list state, this provider
    // doesn't need to hold any state itself. It just renders the children.
    const value = {};

    return (
        <AnimeContext.Provider value={value}>
            {children}
        </AnimeContext.Provider>
    );
};
