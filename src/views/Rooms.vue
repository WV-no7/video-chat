/* eslint-disable prettier/prettier */
<template>
    <div class="container mt-4">
        <div class="d-flex justify-content-between">
        <!-- </div>
        <div class="row justify-content-center"> -->
            <div class="container col-11 col-md-8 col-lg-6">
                <div class="card">
                    <div class="card-body py-2">
                        <h4 class="card-title m-0 text-center">Your Meeting rooms</h4>
                    </div>
                    <div class="list-group list-group-flush">
                        <div class="list-group-item d-flex justify-content-between" v-for="item in rooms" :key="item.id">
                            <section class="pl-3 text-left align-self-center">
                                {{ item.name }}
                            </section>
                            <section class="btn-group align-self-center" role="group" aria-label="Room Options">
                                
                                <router-link class="btn btn-sm btn-outline-secondary text-success" title="Start meeting" :to="`/checkin/${user.uid}/${item.id}`">
                                    <font-awesome-icon icon="video"></font-awesome-icon>
                                </router-link>
                                <button
                                    class="btn btn-sm btn-outline-secondary text-danger"
                                    title="Delete meeting"
                                    @click.prevent="$emit('deleteRoom', item.id)"
                                >
                                    <font-awesome-icon icon="trash"></font-awesome-icon>
                                </button>


                                <!-- <router-link class="btn btn-sm btn-outline-secondary" title="Chat" :to="`/chat/${user.uid}/${item.id}`">
                                    <font-awesome-icon icon="video"></font-awesome-icon>
                                </router-link> -->
                            </section>
                        </div>
                    </div>
                </div>
            </div>
            <div class="container col-12 col-md-9 col-lg-7">
                <h4 class="font-weight-light text-center">Add a Room</h4>

                <div class="card bg-light">
                    <div class="card-body text-center">
                        <form class="formgroup">
                            <div class="input-group input-group-lg">
                                <input
                                type="text"
                                class="form-control"
                                name="roomName"
                                placeholder="Room name"
                                aria-describedby="buttonAdd"
                                v-model="roomName"
                                ref="roomName"
                                />
                                <div class="input-group-append">
                                    <button
                                        type="submit"
                                        class="btn btn-sm btn-info"
                                        id="buttonAdd"
                                        @click.prevent="handleAdd"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

export default {
    name: 'Rooms',
    data: function(){
        return {
            roomName: null
        }
    },
    components:{
       FontAwesomeIcon 
    },
    methods: {
        handleAdd: function(){
            this.$emit('addRoom', this.roomName)
            this.roomName = null
            this.$refs.roomName.focus()
        }
    },
    props: ['rooms', 'user'],
    mounted() {
        firebase.auth().onAuthStateChanged( user => {
            if(user){
                this.displayName = user.displayName
            }else{
                this.$router.replace('/')
            }
        })
    }
}
</script>