<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use App\Classes\Socket\videoWebSocket;

class WebsocketServer extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ws_server:serve';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'websocket server';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('websocket server starting on port: 8080');
        $server = IoServer::factory(
            new HttpServer(
                new WsServer(
                    new videoWebSocket()
                )
            ),
            8080
        );
    
        $server->run();

    }
}