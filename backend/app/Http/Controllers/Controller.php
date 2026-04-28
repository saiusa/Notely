<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;

    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            if (auth()->check() && auth()->user()->is_suspended) {
                if (method_exists(auth()->user(), 'tokens')) {
                    auth()->user()->tokens()->delete();
                }
                auth()->guard('web')->logout();
                abort(403, 'Your account has been suspended by an administrator.');
            }
            return $next($request);
        });
    }
}
