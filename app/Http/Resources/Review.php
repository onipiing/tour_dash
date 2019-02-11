<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class Review extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        //return parent::toArray($request);
        return [
            "id" => $this->id,
            "created_at" => $this->created_at,
            "approved" => $this->approved,
            "author" => [
                "id" => $this->author->id,
                "name" => $this->author->name,
                "avatar" => $this->author->avatar
            ],
            "accommodation" => [
                "id" => $this->accommodation->id,
                "title" => $this->accommodation->title
            ],
            "rating" => $this->rating,
            "review" => $this->review
        ];
    }
}
