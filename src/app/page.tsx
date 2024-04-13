'use client';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Amplify } from 'aws-amplify';
import { get, post } from 'aws-amplify/api';
import { fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth';
import { useEffect, useState } from 'react';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolClientId: '3k1crba5babiuvgj23vlrm8t77',
      userPoolId: 'ap-southeast-1_1DoOrWSbD',
    },
  },

  API: {
    REST: {
      hello: {
        endpoint: 'https://nvgsmh2mre.execute-api.ap-southeast-1.amazonaws.com/v1',
        region: 'ap-southeast-1',
        service: 'api-gateway',
      },
    },
  },
});

export default function Home() {
  const [attributes, setAttributes] = useState<any>({});
  const [idToken, setIdToken] = useState('');

  useEffect(() => {
    const getAttributes = async () => {
      return await fetchUserAttributes();
    };

    getAttributes().then((value) => {
      setAttributes(value);
    });
    fetchAuthSession().then(({ tokens }) => {
      setIdToken(tokens?.idToken?.toString() ?? '');
    });
  }, []);

  const getUserData = async () => {
    const restOperation = await get({
      apiName: 'hello',
      path: '/hello',
      options: {
        headers: {
          Authorization: idToken,
        },
      },
    }).response;
    const body = await restOperation.body.blob();
    console.log('response', body);
  };

  const postData = async () => {
    const response = await post({
      apiName: 'hello',
      path: '/hello',
      options: {
        body: {
          ...attributes,
        },
        headers: {
          Authorization: idToken,
        },
      },
    }).response;

    console.log('response', await response.body.json());
  };

  return (
    <body>
      <Authenticator
        loginMechanisms={['email']}
        signUpAttributes={['name']}
        socialProviders={['amazon', 'apple', 'facebook', 'google']}
      >
        {({ signOut, user }) => {
          return (
            <main>
              <h1>Hello {attributes['name']}</h1>
              <p>Secret message</p>
              <button onClick={postData}>Call API</button>
              <br />
              <button onClick={signOut}>Sign out</button>
            </main>
          );
        }}
      </Authenticator>
    </body>
  );
}
