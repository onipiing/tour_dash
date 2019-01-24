<?php

namespace App\Http\Controllers\API;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Http\Controllers\Controller;
use App\Page;
use Illuminate\Http\Request;
use App\Http\Resources\Page as PageResource;
use Validator;
use Illuminate\Validation\Rule;
use Debugbar;

class PageController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return PageResource::collection(Page::orderBy('title')->paginate(10));
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create(Request $request)
    {
        $input = $request->all();
        $validator = Validator::make($input, [
            'title' => 'required|unique:pages',
            'slug' => 'unique:pages',
            'user_id' => 'required|numeric',
            'content' => 'required|array',
            'type' => ['required', Rule::in(['vsebinska', 'naslovnica'])]
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }
        
        try {
            $page = Page::create($input);
            return response()->json(['success' => 'Stran je bila uspešno objavljena!', 'data' => $page]);

        } catch(Exception $e) {
            Debugbar::info($e);
            return response()->json(['error' => $e->getMessage()], 400);
        } catch(Throwable $e) {
            Debugbar::info($e);
            return response()->json(['error' => $e->getMessage()], 400);
        }

        return response()->json(['success' => 'do sm je pršlo!']);

    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Page  $page
     * @return \Illuminate\Http\Response
     */
    public function show(Page $page, $id)
    {
        try {
            $res = $page->findOrFail($id);
            Debugbar::info($res);
            return new PageResource($res);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'Zahtevana stran ne obstaja...']);
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Page  $page
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Page $page, $id)
    {
        $input = $request->all();
        $validator = Validator::make($input, [
            'title' => 'required',
            'user_id' => 'required|numeric',
            'content' => 'required|array',
            'type' => ['required', Rule::in(['vsebinska', 'naslovnica'])]
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        try {
            $page->findOrFail($id)->update($input);
            return response()->json(['success' => 'Stran je bila uspešno posodobljena!'], 200);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'Zahtevana stran ne obstaja...']);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Page  $page
     * @param $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Page $page, $id)
    {
        try {
            $page->findOrFail($id)->destroy($id);
            return PageResource::collection(Page::orderBy('title')->paginate(10));
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'Zahtevana stran ne obstaja.'], 404);
        }
    }

    // Search pages
    public function search(Request $request)
    {
        $input = $request->only('q');
        $q = $input['q'];
        
        $result = Page::where('title', 'LIKE', '%' . $q . '%')->orWhere('slug', 'LIKE', '%' . $q . '%')->orderBy('title');
        return PageResource::collection($result->paginate(10));
    }
}
