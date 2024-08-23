'use client'
import React, { useState } from 'react';
import { Box, Button, Typography, AppBar, Toolbar, Paper, IconButton, TextField, Stack } from '@mui/material';
import { Send as SendIcon, Close as CloseIcon } from '@mui/icons-material';

const HomePage = ({ onGenerate }) => {
  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'grey.900',
      }}
    >
      <Typography variant="h3" sx={{ color: 'white', mb: 2 }}>
        Welcome to Rate My Professor
      </Typography>
      <Typography variant="h5" sx={{ color: 'grey.300', mb: 4 }}>
        Get instant feedback on professors
      </Typography>
      <Button variant="contained" color="secondary" onClick={onGenerate}>
        Generate
      </Button>
    </Box>
  );
};

const ChatBox = ({ messages, setMessages, message, setMessage, sendMessage, onClose }) => {
  return (
    <Paper sx={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      width: '600px',
      maxHeight: '900px',
      overflow: 'hidden',
      borderRadius: '16px',
      boxShadow: 3,
      bgcolor: 'rgba(255, 255, 255, 0.8)',
    }}>
      <AppBar position="static" sx={{
        bgcolor: 'rgba(0, 0, 0, 0.7)',
      }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: 'white' }}> Chat </Typography>
          <IconButton color="inherit" onClick={onClose}> <CloseIcon /> </IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{
        height: 'calc(100% - 64px)',
        p: 1,
        overflowY: 'auto',
        bgcolor: 'rgba(255, 255, 255, 0.1)',
      }}>
        {messages.map((message, index) => (
          <Box key={index} display="flex" justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'} mb={1}>
            <Box
              bgcolor={message.role === 'assistant' ? 'primary.main' : 'secondary.main'}
              color="white"
              borderRadius={20}
              p={2}
              maxWidth="70%"
              boxShadow={2}
            >
              {message.content}
            </Box>
          </Box>
        ))}
      </Box>
      <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            label="Type your message..."
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            variant="outlined"
            size="small"
            InputProps={{ style: { color: 'blue' } }}
          />
          <IconButton color="primary" onClick={sendMessage}> <SendIcon /> </IconButton>
        </Stack>
      </Box>
    </Paper>
  );
};

const App = () => {
  const [isChatVisible, setChatVisible] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm the Rate My Professor support assistant. How can I help you today?`,
    },
  ]);
  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    if (message.trim()) {
      setMessages((messages) => [
        ...messages,
        { role: 'user', content: message },
        { role: 'assistant', content: '' },
      ]);
      setMessage('');

      const response = fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      }).then(async (res) => {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let result = '';

        return reader.read().then(function processText({ done, value }) {
          if (done) {
            return result;
          }
          const text = decoder.decode(value || new Uint8Array(), { stream: true });
          setMessages((messages) => {
            let lastMessage = messages[messages.length - 1];
            let otherMessages = messages.slice(0, messages.length - 1);
            return [
              ...otherMessages,
              { ...lastMessage, content: lastMessage.content + text },
            ];
          });
          return reader.read().then(processText);
        });
      });
    }
  };

  return (
    <Box sx={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <HomePage onGenerate={() => setChatVisible(true)} />
      {isChatVisible && (
        <ChatBox
          messages={messages}
          setMessages={setMessages}
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
          onClose={() => setChatVisible(false)}
        />
      )}
    </Box>
  );
};

export default App;