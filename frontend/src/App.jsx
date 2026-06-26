import React from 'react';
import { SocketProvider } from './context/SocketContext';
import AgentDashboard from './components/AgentDashboard';

function App() {
  return (
    <SocketProvider>
      <AgentDashboard />
    </SocketProvider>
  );
}

export default App;
