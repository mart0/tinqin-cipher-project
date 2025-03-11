import React, { ReactNode } from 'react';
import { Navigation } from '../index';
import KeyInfo from '../../utils/KeyInfo';

interface NavigationContainerProps {
    children: ReactNode;
    title?: string;
}

const NavigationContainer: React.FC<NavigationContainerProps> = ({
    children,
    title
}) => {
    return (
        <>
            <Navigation title={title} />
            <div className="container">
                <KeyInfo />
                {children}
            </div>
        </>
    );
};

export default NavigationContainer; 