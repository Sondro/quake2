# MD2 file format (Quake 2's models)

Written by David Henry, 19^th^ December 2004

from http://tfc.duke.free.fr/coding/md2-specs-en.html


## Introduction

The MD2 model file format was introduced by _id Software_ when releasing Quake 2 in November 1997. It's a file format quite simple to use and understand. MD2 models' characteristics are these:

* Model's geometric data (triangles);
* Frame-by-frame animations;
* Structured data for drawing the model using `GL_TRIANGLE_FAN` and `GL_TRIANGLE_STRIP` primitives (called “OpenGL commands”).

Model's texture is in a separate file. One MD2 model can have only one texture at the same time.

MD2 model file's extension is “md2”. A MD2 file is a binary file divided in two part: the header dans the data. The header contains all information needed to use and manipulate the data.


## Variable Sizes

Variable types used in this document have those sizes:

* **char**: 1 byte
* **short**: 2 bytes
* **int**: 4 bytes
* **float**: 4 bytes

They correspond to C type sizes on the x86 architecture. Ensure that type sizes correspond to these ones if you're compiling for another architecture.


## Endianness Issues

Since the MD2 file format is a binary format, you'll have to deal with endianess. MD2 files are stored in little-endian (x86). If you're targetting a big-endian architecture (PowerPC, SPARC, ...), or simply want your program to be portable, you'll have to perform proper conversions for each word or double word read from the file.


## The header

The header is a structure which comes at the beginning of the file:

```C
/* MD2 header */
struct md2_header_t
{
  int ident;                  /* magic number: "IDP2" */
  int version;                /* version: must be 8 */

  int skinwidth;              /* texture width */
  int skinheight;             /* texture height */

  int framesize;              /* size in bytes of a frame */

  int num_skins;              /* number of skins */
  int num_vertices;           /* number of vertices per frame */
  int num_st;                 /* number of texture coordinates */
  int num_tris;               /* number of triangles */
  int num_glcmds;             /* number of opengl commands */
  int num_frames;             /* number of frames */

  int offset_skins;           /* offset skin data */
  int offset_st;              /* offset texture coordinate data */
  int offset_tris;            /* offset triangle data */
  int offset_frames;          /* offset frame data */
  int offset_glcmds;          /* offset OpenGL command data */
  int offset_end;             /* offset end of file */
};
```

`ident` is the magic number of the file. It is used to identify the file type. ident must be equal to 844121161 or to the string “IDP2”. We can obtain this number with the expression `(('2'<<24) + ('P'<<16) + ('D'<<8) + 'I')`.

`version` is the version number of the file format and must be equal to 8.

`skinwidth` and `skinheight` are respectively the texture width and the texture height of the model.

`framesize` is the size in bytes of a frame and all its data.

`num_skins` is the number of associated textures to the model.
`num_vertices` is the number of vertices for one frame.
`num_st` is the number of texture coordinates.
`num_tris` is the number of triangles.
`num_glcmds` is the number of OpenGL commands.
`num_frames` is the number of frame the model has.

`offset_skins` indicates the position in bytes from the beginning of the file to the texture data.
`offset_st` indicates the position of texture coordinate data.
`offset_tris` indicates the position of triangle data.
`offset_frames` indicates the position of frame data.
`offset_glcmds` indicates the position of OpenGL commands.
`offset_end` indicates the position of the end of the file.


## Data types

### Vector

The vector, composed of three floating coordinates (x, y, z):

```C
/* Vector */
typedef float vec3_t[3];
```

### Texture information

Texture informations are the list of texture names associated to the model:

```C
/* Texture name */
struct md2_skin_t
{
  char name[64];              /* texture file name */
};
```

### Texture coordinates

Texture coordinates are stored in a structure as _short_ integers. To get the true texture coordinates, you have to divide `s` by `skinwidth` and `t` by `skinheight`:

```C
/* Texture coords */
struct md2_texCoord_t
{
  short s;
  short t;
};
```

### Triangles

Each triangle has an array of vertex indices and an array of texture coordinate indices.

```C
/* Triangle info */
struct md2_triangle_t
{
  unsigned short vertex[3];   /* vertex indices of the triangle */
  unsigned short st[3];       /* tex. coord. indices */
};
```

### Vertices

Vertices are composed of “compressed” 3D coordinates, which are stored in one byte for each coordinate, and of a normal vector index. The normal vector array is stored in the [anorms.h](https://github.com/id-Software/Quake-2/blob/master/ref_gl/anorms.h) file of Quake 2 and hold 162 vectors in floating point (3 _float_).

```C
/* Compressed vertex */
struct md2_vertex_t
{
  unsigned char v[3];         /* position */
  unsigned char normalIndex;  /* normal vector index */
};
```

### Frames

Frames have specific informations for itself and the vertex list of the frame. Informations are used to uncompress vertices and obtain the real coordinates.

```C
/* Model frame */
struct md2_frame_t
{
  vec3_t scale;               /* scale factor */
  vec3_t translate;           /* translation vector */
  char name[16];              /* frame name */
  struct md2_vertex_t *verts; /* list of frame's vertices */
};
```

To uncompress vertex coordinates, you need to multiply each component by the scale factor and then add the respective translation component:

```C
vec3_t v;                     /* real vertex coords. */
struct md2_vertex_t vtx;      /* compressed vertex */
struct md2_frame_t frame;     /* a model frame */

v[i] = (vtx.v[i] * frame.scale[i]) + frame.translate[i];
```

### OpenGL Commands

OpenGL commands are stored in an array of integer (int). They are discussed at the end of this document.


## Reading an MD2 file

Assuming that `md2_model_t` is a structure holding all your model's data and `*mdl` a pointer on a `md2_model_t` object, this code show how to load a MD2 model file:

```C
int
ReadMD2Model (const char *filename, struct md2_model_t *mdl)
{
  FILE *fp;
  int i;

  fp = fopen (filename, "rb");
  if (!fp)
    {
      fprintf (stderr, "Error: couldn't open \"%s\"!\n", filename);
      return 0;
    }

  /* Read header */
  fread (&mdl->header, 1, sizeof (struct md2_header_t), fp);

  if ((mdl->header.ident != 844121161) ||
      (mdl->header.version != 8))
    {
      /* Error! */
      fprintf (stderr, "Error: bad version or identifier\n");
      fclose (fp);
      return 0;
    }

  /* Memory allocations */
  mdl->skins = (struct md2_skin_t *)
    malloc (sizeof (struct md2_skin_t) * mdl->header.num_skins);
  mdl->texcoords = (struct md2_texCoord_t *)
    malloc (sizeof (struct md2_texCoord_t) * mdl->header.num_st);
  mdl->triangles = (struct md2_triangle_t *)
    malloc (sizeof (struct md2_triangle_t) * mdl->header.num_tris);
  mdl->frames = (struct md2_frame_t *)
    malloc (sizeof (struct md2_frame_t) * mdl->header.num_frames);
  mdl->glcmds = (int *)malloc (sizeof (int) * mdl->header.num_glcmds);

  /* Read model data */
  fseek (fp, mdl->header.offset_skins, SEEK_SET);
  fread (mdl->skins, sizeof (struct md2_skin_t),
     mdl->header.num_skins, fp);

  fseek (fp, mdl->header.offset_st, SEEK_SET);
  fread (mdl->texcoords, sizeof (struct md2_texCoord_t),
     mdl->header.num_st, fp);

  fseek (fp, mdl->header.offset_tris, SEEK_SET);
  fread (mdl->triangles, sizeof (struct md2_triangle_t),
     mdl->header.num_tris, fp);

  fseek (fp, mdl->header.offset_glcmds, SEEK_SET);
  fread (mdl->glcmds, sizeof (int), mdl->header.num_glcmds, fp);

  /* Read frames */
  fseek (fp, mdl->header.offset_frames, SEEK_SET);
  for (i = 0; i < mdl->header.num_frames; ++i)
    {
      /* Memory allocation for vertices of this frame */
      mdl->frames[i].verts = (struct md2_vertex_t *)
    malloc (sizeof (struct md2_vertex_t) * mdl->header.num_vertices);

      /* Read frame data */
      fread (mdl->frames[i].scale, sizeof (vec3_t), 1, fp);
      fread (mdl->frames[i].translate, sizeof (vec3_t), 1, fp);
      fread (mdl->frames[i].name, sizeof (char), 16, fp);
      fread (mdl->frames[i].verts, sizeof (struct md2_vertex_t),
         mdl->header.num_vertices, fp);
    }

  fclose (fp);
  return 1;
}
```


## Rendering the model

Here is an exemple of how to draw a frame n of a model `mdl`:

```C
void
RenderFrame (int n, const struct md2_model_t *mdl)
{
  int i, j;
  GLfloat s, t;
  vec3_t v;
  struct md2_frame_t *pframe;
  struct md2_vertex_t *pvert;

  /* Check if n is in a valid range */
  if ((n < 0) || (n > mdl->header.num_frames - 1))
    return;

  /* Enable model's texture */
  glBindTexture (GL_TEXTURE_2D, mdl->tex_id);

  /* Draw the model */
  glBegin (GL_TRIANGLES);
    /* Draw each triangle */
    for (i = 0; i < mdl->header.num_tris; ++i)
      {
    /* Draw each vertex */
    for (j = 0; j < 3; ++j)
      {
        pframe = &mdl->frames[n];
        pvert = &pframe->verts[mdl->triangles[i].vertex[j]];

        /* Compute texture coordinates */
        s = (GLfloat)mdl->texcoords[mdl->triangles[i].st[j]].s / mdl->header.skinwidth;
        t = (GLfloat)mdl->texcoords[mdl->triangles[i].st[j]].t / mdl->header.skinheight;

        /* Pass texture coordinates to OpenGL */
        glTexCoord2f (s, t);

        /* Normal vector */
        glNormal3fv (anorms_table[pvert->normalIndex]);

        /* Calculate vertex real position */
        v[0] = (pframe->scale[0] * pvert->v[0]) + pframe->translate[0];
        v[1] = (pframe->scale[1] * pvert->v[1]) + pframe->translate[1];
        v[2] = (pframe->scale[2] * pvert->v[2]) + pframe->translate[2];

        glVertex3fv (v);
      }
      }
  glEnd ();
}
```


## Animation

MD2 models are frame-by-frame animated. A frame is a screenshot of an animation. To avoid jerky and ugly animations, we use linear interpolation between vertex coordinates of two consecutive frames (the current frame we are drawing and the next frame). We do the same for the normal vector:

```C
struct md2_frame_t *pframe1, *pframe2;
struct md2_vertex_t *pvert1, *pvert2;
vec3_t v_curr, v_next, v;

for (/* ... */)
  {
    pframe1 = &mdl->frames[current];
    pframe2 = &mdl->frames[current + 1];
    pvert1 = &pframe1->verts[mdl->triangles[i].vertex[j]];
    pvert2 = &pframe2->verts[mdl->triangles[i].vertex[j]];

    /* ... */

    v_curr[0] = (pframe1->scale[0] * pvert1->v[0]) + pframe1->translate[0];
    v_curr[1] = (pframe1->scale[1] * pvert1->v[1]) + pframe1->translate[1];
    v_curr[2] = (pframe1->scale[2] * pvert1->v[2]) + pframe1->translate[2];

    v_next[0] = (pframe2->scale[0] * pvert2->v[0]) + pframe2->translate[0];
    v_next[1] = (pframe2->scale[1] * pvert2->v[1]) + pframe2->translate[1];
    v_next[2] = (pframe2->scale[2] * pvert2->v[2]) + pframe2->translate[2];

    v[0] = v_curr[0] + interp * (v_next[0] - v_curr[0]);
    v[1] = v_curr[1] + interp * (v_next[1] - v_curr[1]);
    v[2] = v_curr[2] + interp * (v_next[2] - v_curr[2]);

    /* ... */
  }
```

v is the final vertex to draw. `interp` is the interpolation percent between the two frames. It's a _float_ which ranges from 0.0 to 1.0. When it is equal to 1.0, `current` is incremented by 1 and `interp` is reinitialized at 0.0. It is useless to interpolate texture coordinates because they are the same for all the model frames. It is preferable that `interp` is related to the program's number of rendering frame per second (fps).

```C
void
Animate (int start, int end, int *frame, float *interp)
{
  if ((*frame < start) || (*frame > end))
    *frame = start;

  if (*interp >= 1.0f)
    {
      /* Move to next frame */
      *interp = 0.0f;
      (*frame)++;

      if (*frame >= end)
    *frame = start;
    }
}
```


## Using OpenGL commands

OpenGL commands are structured data for drawing the model using only `GL_TRIANGLE_FAN` and `GL_TRIANGLE_STRIP` primitives. It's an array of integers (_int_) which can be read in packets:

* The first integer is the number of vertices to draw for a new primitive. If it's a positive value, the primitive is `GL_TRIANGLE_STRIP`, otherwise it's a `GL_TRIANGLE_FAN`.
* The next integers can be taken by packet of 3 for as many vertices as there is to draw. The two first are the texture coordinates in floating point and the third is the vertex index to draw.
* When the number of vertices to draw is 0, then we have finished rendering the model.

We can create a structure for those data packets:

```C
/* GL command packet */
struct md2_glcmd_t
{
  float s;                    /* s texture coord. */
  float t;                    /* t texture coord. */
  int index;                  /* vertex index */
};
```

Using this rendering algorithm implies a better frame rate than the classical method because we don't use `GL_TRIANGLES` primitives but `GL_TRIANGLE_FAN` and `GL_TRIANGLE_STRIP` primitives (which use less GPU time) and texture coordinates are no longer calculated (no need do divide by skinwidth and skinheight). Here is an exemple of how to use them:

```C
void
RenderFrameWithGLCmds (int n, const struct md2_model_t *mdl)
{
  int i, *pglcmds;
  vec3_t v;
  struct md2_frame_t *pframe;
  struct md2_vertex_t *pvert;
  struct md2_glcmd_t *packet;

  /* Check if n is in a valid range */
  if ((n < 0) || (n > mdl->header.num_frames - 1))
    return;

  /* Enable model's texture */
  glBindTexture (GL_TEXTURE_2D, mdl->tex_id);

  /* pglcmds points at the start of the command list */
  pglcmds = mdl->glcmds;

  /* Draw the model */
  while ((i = *(pglcmds++)) != 0)
    {
      if (i < 0)
    {
      glBegin (GL_TRIANGLE_FAN);
      i = -i;
    }
      else
    {
      glBegin (GL_TRIANGLE_STRIP);
    }

      /* Draw each vertex of this group */
      for (/* Nothing */; i > 0; --i, pglcmds += 3)
    {
      packet = (struct md2_glcmd_t *)pglcmds;
      pframe = &mdl->frames[n];
      pvert = &pframe->verts[packet->index];

      /* Pass texture coordinates to OpenGL */
      glTexCoord2f (packet->s, packet->t);

      /* Normal vector */
      glNormal3fv (anorms_table[pvert->normalIndex]);

      /* Calculate vertex real position */
      v[0] = (pframe->scale[0] * pvert->v[0]) + pframe->translate[0];
      v[1] = (pframe->scale[1] * pvert->v[1]) + pframe->translate[1];
      v[2] = (pframe->scale[2] * pvert->v[2]) + pframe->translate[2];

      glVertex3fv (v);
    }

      glEnd ();
    }
}
```


## Constants

Here are some constant values defining maximal dimensions:

* Maximum number of triangles: 4096
* Maximum number of vertices: 2048
* Maximum number of texture coordinates: 2048
* Maximum number of frames: 512
* Maximum number of skins: 32
* Number of precalculated normal vectors: 162
