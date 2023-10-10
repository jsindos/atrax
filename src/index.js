import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloClient, InMemoryCache, ApolloProvider, gql, useQuery } from '@apollo/client'
import { createUploadLink } from 'apollo-upload-client'

import '@/styles/index.css'
import { Button } from './components/ui/button'

const BASE_URL = 'http://localhost:8080'

const link = createUploadLink({
  uri: `${BASE_URL}/graphql`,
  credentials: 'include'
})

const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
})

const Customers = gql`
    query Customers {
      customers {
        id
        name
        workInstructions {
          id
          title
        }
      }
    }
  `

const SomeComponent = () => {
  const { data: { customers } = {}, loading } = useQuery(Customers)

  console.log(customers)

  return <div />
}

const App = () => {
  return (
    <ApolloProvider client={client}>
      <SomeComponent />
      <Button>
        kafhkajh
      </Button>
    </ApolloProvider>
  )
}

const wrapper = document.getElementById('root')
ReactDOM.render(<App />, wrapper)
