<?php

namespace App\Classes\Socket;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class videoWebSocket implements MessageComponentInterface {
// массивы для хранения всех подключенных пользователей и свободных
    protected $allUsers=[];
    protected $freeUsers=[];
//метод срабатывает при новом соединении 
    public function onOpen(ConnectionInterface $connection) {
        echo "New connection->{$connection->resourceId}\n";
         
       
    }
//метод срабатывает при новом сообщении со стороны клиента
    public function onMessage(ConnectionInterface $connection, $data) {
              
        $dataFromClient = json_decode($data);
        switch($dataFromClient->type){            
            case 'login':
                $userName = $dataFromClient->userName;            
                $resArr = ['type' => 'ok',                                               
                           'users' => array_keys($this->freeUsers)];
                $this->allUsers[$userName]=$connection;
                $this->freeUsers[$userName]=$connection; 
                $connection->send(json_encode($resArr));                 
                $resArr= json_encode(['type' => 'userLoggedIn', 'userName' => $userName]);
                foreach($this->allUsers as $name => $conn){
                    if($conn !== $connection){                     
                     $conn->send($resArr);
                    }             
                }   
                break;             
            case 'busy':
                unset($this->freeUsers[$dataFromClient->userName]);
                foreach($this->allUsers as $name => $conn){
                    if($conn !== $connection){                    
                        $conn->send($data);
                    }
                }
                break;
            case 'free':
                $this->freeUsers[$dataFromClient->userName] = $connection;
                foreach($this->allUsers as $name => $conn){
                    if($conn !== $connection){
                     $conn->send($data);
                    }
             }
             case 'close':
                $this->freeUsers[$dataFromClient->userName] = $connection;
                echo"CLOSE";
                break;
             
            default:    
                $toUser = $dataFromClient->toUser;                
                $this->allUsers[$toUser]->send($data);
            }
    }
//метод срабатывает при закрытии соединения
    public function onClose(ConnectionInterface $connection) {
        $userName = array_search($connection, $this->allUsers);
        if($userName!==false){                       
        $resArr = json_encode(['type' => 'userLoggedOut','userName' => $userName]);
            unset($this->freeUsers[$userName]);
            unset ($this->allUsers[$userName]);
            foreach($this->allUsers as $name => $conn){
                if($conn !== $connection){
                 $conn->send($resArr);
                }
         }
        }
        

    }
//метод срабатывает при ошибках
    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "An error has occurred: {$e->getMessage()}\n";

        $conn->close();
    }
}