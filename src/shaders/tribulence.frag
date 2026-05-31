#version 300 es
precision highp float;

// Tribulence 3D by chronos — https://www.shadertoy.com/view/fXj3WG
// Ported to this harness verbatim: mainImage->main, fragCoord derived from
// vUv, iTime->uTime, iResolution->uResolution. Algorithm unchanged.
// (GLSL ES 3.0 — needs round() and dynamic float loops.)

uniform vec2  uResolution;
uniform float uTime;

in vec2 vUv;
out vec4 fragColor;

const float PI = 3.14159265;

vec3 tri(vec3 p) { return 1. - abs(p - round(p))*4.; } // triangle wave

// fm : frequency modulation.
vec3 fm(vec3 p) { return tri(p + .7 * tri(1.9 * p + .8)); }

vec3 tribulence(vec3 p, float T)
{
    float angle = 2.399; // Approx golden angle
    float c = cos(angle), s = sin(angle);
    mat2 R = mat2(c,s,-s,c);
    for(float i = 1e-3; i < 5.; i+=i)
    {
        p += fm(p.zyx / i * .7 + T * .0125) * i *.025;
        p.xy *= R;
        p = p.zyx;
    }
    return p;
}

vec3 cmap(float x, float T)
{
    return exp2(cos(T*PI+2.*PI*x+vec3(1,2,3)));
}

float kernel(float x, float dt) { return .001/(x*x+dt); }


float sRGBencode(float C_linear) { return C_linear > 0.0031308 ? (1.055 * pow(C_linear, 1./2.4) - 0.055) : (12.92 * C_linear); }
vec3 sRGBencode(vec3 C_linear) { C_linear = clamp(C_linear, 0., 1.); return vec3(sRGBencode(C_linear.x), sRGBencode(C_linear.y), sRGBencode(C_linear.z)); }


void main()
{
    vec2 fragCoord = vUv * uResolution;

    vec2 uv = (2. * fragCoord - uResolution.xy)/uResolution.y;
    float ps = 2. / uResolution.y;

    float angle = uTime*.1; // Approx golden angle
    float c = cos(angle), s = sin(angle);
    mat2 R = mat2(c,s,-s,c);

    float focal = 2.5;
    vec3 rd = normalize(vec3(uv, -focal));
    vec3 ro = vec3(0,0,3);

    ro.xz *= R;
    rd.xz *= R;

    vec3 color = vec3(0);

    angle = 2.399; // Approx golden angle
    c = cos(angle), s = sin(angle);
    R = mat2(c,s,-s,c);
    float T = uTime;
    float t = 0.;
    for(float i = 0.; i < 99. && t < 1e3; i++)
    {
        vec3 p = rd * t + ro;
        vec3 q = p;

        p = tribulence(p, T);
        p.xz *= R;
        p = p.zyx;
        p = tribulence(p, T);
        p.xz *= R;
        p = p.zyx;
        p = tribulence(p, T);

        float sdf = length(p)-.25;
        sdf = abs(sdf)-.1;
        sdf = abs(sdf)-.1;
        sdf = abs(sdf)-.1;
        sdf = abs(sdf)-.1;
        sdf = abs(sdf)-.1;

        float dt = abs(sdf) *.4 + 4e-3;

        float K = kernel(sdf, dt);

        color += cmap(K, T)*K*.5;
        T += sdf * .75;

        t += dt;

    }

    color *= 1.-dot(uv,uv)*.1;
    color = 1.-exp(-color);
    color = sRGBencode(color);
    fragColor = vec4(color, 1);

}
