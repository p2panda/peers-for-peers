import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';

import { usePanda } from '../p2panda/hooks';
import { useProfile } from '../hooks';

export const Hello = () => {
  const { publicKey } = usePanda();
  const { isLoading, profile, setProfile } = useProfile(publicKey);
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (profile && profile.username) {
      setUsername(profile.username);
    }
  }, [profile]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setProfile({
      username,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <span>✨ Hello, my name is </span>
      <span className="nowrap">
        <input
          disabled={isLoading}
          className="username"
          onChange={handleChange}
          value={username}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="username-submit"
        />
      </span>
    </form>
  );
};
