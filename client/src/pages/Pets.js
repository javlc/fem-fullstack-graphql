import React, {useState} from 'react'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'
import PetsList from '../components/PetsList'
import NewPetModal from '../components/NewPetModal'
import Loader from '../components/Loader'

const PETS_FIELDS = gql`
  fragment PetsFields on Pet {
    id
    name
    type
    img
    vaccinated @client
    owner {
      id
      age @client
    }
  }
`

const GET_PETS = gql`
  query AllPets {
    pets {
      ...PetsFields
    }
  }
  ${PETS_FIELDS}
`
const ADD_PET = gql`
  mutation AddPet($newPet: NewPetInput!) {
    addPet(input: $newPet) {
      ...PetsFields
    }
  }
  ${PETS_FIELDS}
`


export default function Pets () {
  const [modal, setModal] = useState(false)

  const {data, loading, error} = useQuery(GET_PETS)
  const [addPet, newPet] = useMutation(ADD_PET, {
    update(cache, {data: {addPet}}) {
      const data = cache.readQuery({
        query: GET_PETS
      })
      cache.writeQuery({
        query: GET_PETS,
        data: { pets: [addPet, ...data.pets] },
      })
    },
  })

  const onSubmit = input => {
    setModal(false)
    addPet({ 
      variables: { newPet: input },
      optimisticResponse: {
        __typename: 'Mutation',
        addPet: {
          __typename: 'Pet',
          id: Math.floor(Math.random() * 10000) + '',
          name: input.name,
          type: input.type,
          img: 'https://placehold.co/300',
          owner: {
            id: Math.floor(Math.random() * 10000) + '',
            age: 47
          }
    
        }
      }
    })
  }

  if (loading) {
    return <Loader />
  }

  if (error || newPet.error) {
    return <p>Error</p>
  }

  if (modal) {
    return <NewPetModal onSubmit={onSubmit} onCancel={() => setModal(false)} />
  }

  return (
    <div className="page pets-page">
      <section>
        <div className="row betwee-xs middle-xs">
          <div className="col-xs-10">
            <h1>Pets</h1>
          </div>

          <div className="col-xs-2">
            <button onClick={() => setModal(true)}>new pet</button>
          </div>
        </div>
      </section>
      <section>
        <PetsList pets={data.pets}/>
      </section>
    </div>
  )
}
