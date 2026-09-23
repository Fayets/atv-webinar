from decouple import config

from src.schemas import VslConfigResponse


class VslServices:
    def get_config(self) -> VslConfigResponse:
        vimeo_id = config("VSL_VIMEO_ID", default="1210850489")
        url = config("VSL_URL", default=f"https://vimeo.com/{vimeo_id}")
        embed_src = f"https://player.vimeo.com/video/{vimeo_id}"
        return VslConfigResponse(url=url, vimeo_id=vimeo_id, embed_src=embed_src)
